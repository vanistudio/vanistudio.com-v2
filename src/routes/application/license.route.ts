import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { licenses } from "@/schemas/license.schema";
import { users } from "@/schemas/user.schema";
import { eq, and } from "drizzle-orm";

export const licensePublicRoutes = new Elysia({ prefix: "/license" })
  .get("/check/:key", async ({ params }) => {
    try {
      const [license] = await db.select({
        id: licenses.id,
        key: licenses.key,
        productName: licenses.productName,
        status: licenses.status,
        domain: licenses.domain,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
      }).from(licenses).where(eq(licenses.key, params.key)).limit(1);

      if (!license) return { success: false, error: "Không tìm thấy license key" };

      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/verify-domain/:domain", async ({ params }) => {
    try {
      const domain = params.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");
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
      const { key, domain } = body as { key: string; domain: string };
      if (!key || !domain) {
        return { valid: false, code: "MISSING_PARAMS", message: "Thiếu license key hoặc domain" };
      }

      const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");

      const [license] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1);
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
      return { valid: false, code: "SERVER_ERROR", message: error.message };
    }
  });
