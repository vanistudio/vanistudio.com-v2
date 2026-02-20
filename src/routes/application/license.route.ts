import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { licenses } from "@/schemas/license.schema";
import { users } from "@/schemas/user.schema";
import { eq, and } from "drizzle-orm";
import { createHmac } from "crypto";

const LICENSE_SECRET = process.env.APP_LICENSE_SECRET || "123";

function generateSignature(key: string, domain: string, timestamp: number): string {
  return createHmac("sha256", LICENSE_SECRET)
    .update(`${key}:${domain}:${timestamp}`)
    .digest("hex");
}

function cleanDomainInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?/, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0]
    .replace(/\/+$/, "")
    .trim();
}

export const licensePublicRoutes = new Elysia({ prefix: "/license" })
  .get("/verify-domain/:domain", async ({ params }) => {
    try {
      const domain = cleanDomainInput(params.domain);
      if (!domain) return { success: false, error: "Vui lòng nhập tên miền hợp lệ" };

      const [license] = await db.select({
        productName: licenses.productName,
        status: licenses.status,
        domain: licenses.domain,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        ownerName: users.fullName,
      }).from(licenses)
        .leftJoin(users, eq(licenses.userId, users.id))
        .where(eq(licenses.domain, domain))
        .limit(1);

      if (!license) return { success: false, error: "Tên miền này chưa được cấp giấy phép hoạt động" };

      const isActive = license.status === "active";
      const isExpired = license.expiresAt ? new Date(license.expiresAt) < new Date() : false;

      return {
        success: true,
        verified: isActive && !isExpired,
        license: {
          productName: license.productName,
          status: isExpired ? "expired" : license.status,
          domain: license.domain,
          ownerName: license.ownerName || null,
          expiresAt: license.expiresAt,
          activatedAt: license.activatedAt,
          createdAt: license.createdAt,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/activate", async ({ body }) => {
    try {
      const { key, domain, timestamp, signature } = body as {
        key: string;
        domain: string;
        timestamp?: number;
        signature?: string;
      };

      if (!key || !domain) {
        return { valid: false, code: "MISSING_PARAMS", message: "Thiếu license key hoặc domain" };
      }

      if (timestamp && signature) {
        const now = Date.now();
        if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
          return { valid: false, code: "EXPIRED_REQUEST", message: "Yêu cầu đã hết hạn" };
        }
        const expectedSig = generateSignature(key, domain, timestamp);
        if (signature !== expectedSig) {
          return { valid: false, code: "INVALID_SIGNATURE", message: "Chữ ký không hợp lệ" };
        }
      }

      const cleanDomain = cleanDomainInput(domain);
      if (!cleanDomain || cleanDomain.length > 253 || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(cleanDomain)) {
        return { valid: false, code: "INVALID_DOMAIN", message: "Tên miền không hợp lệ" };
      }

      if (key.length > 50 || !/^[A-Z0-9-]+$/.test(key)) {
        return { valid: false, code: "INVALID_KEY", message: "License key không hợp lệ" };
      }

      const [license] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1);

      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));

      if (!license) {
        return { valid: false, code: "INVALID_KEY", message: "License key không hợp lệ" };
      }

      if (license.status === "revoked") {
        return { valid: false, code: "REVOKED", message: "License đã bị thu hồi" };
      }

      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        return { valid: false, code: "EXPIRED", message: "License đã hết hạn" };
      }

      if (license.domain && license.domain !== cleanDomain) {
        return { valid: false, code: "DOMAIN_MISMATCH", message: "License không được cấp cho domain này" };
      }

      if (!license.domain || license.status === "unused") {
        await db.update(licenses)
          .set({
            domain: cleanDomain,
            status: "active",
            activatedAt: license.activatedAt || new Date(),
            updatedAt: new Date(),
          })
          .where(eq(licenses.id, license.id));
      }

      return {
        valid: true,
        code: "VALID",
        message: "License hợp lệ",
        license: {
          productName: license.productName,
          domain: license.domain || cleanDomain,
          expiresAt: license.expiresAt,
        },
      };
    } catch (error: any) {
      return { valid: false, code: "SERVER_ERROR", message: "Lỗi hệ thống" };
    }
  });