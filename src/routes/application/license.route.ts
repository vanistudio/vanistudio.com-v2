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

// ── In-memory cache ──
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 phút

function getCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any, ttl = CACHE_TTL) {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

function invalidateCache(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiry) cache.delete(key);
  }
}, 5 * 60 * 1000);

export const licensePublicRoutes = new Elysia({ prefix: "/license" })
  .get("/verify-domain/:domain", async ({ params }) => {
    try {
      const domain = cleanDomainInput(params.domain);
      if (!domain) return { success: false, error: "Vui lòng nhập tên miền hợp lệ" };

      const cacheKey = `verify:${domain}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

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

      if (!license) {
        const result = { success: false, error: "Tên miền này chưa được cấp giấy phép hoạt động" };
        setCache(cacheKey, result, 2 * 60 * 1000);
        return result;
      }

      const isActive = license.status === "active";
      const isExpired = license.expiresAt ? new Date(license.expiresAt) < new Date() : false;

      const result = {
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

      setCache(cacheKey, result);
      return result;
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

      const cacheKey = `activate:${key}:${cleanDomain}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      if (key.length > 50 || !/^[A-Z0-9-]+$/.test(key)) {
        return { valid: false, code: "INVALID_KEY", message: "License key không hợp lệ" };
      }

      const [license] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1);

      if (!license) {
        const result = { valid: false, code: "INVALID_KEY", message: "License key không hợp lệ" };
        setCache(cacheKey, result, 2 * 60 * 1000);
        return result;
      }

      if (license.status === "revoked") {
        const result = { valid: false, code: "REVOKED", message: "License đã bị thu hồi" };
        setCache(cacheKey, result, 2 * 60 * 1000);
        return result;
      }

      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        const result = { valid: false, code: "EXPIRED", message: "License đã hết hạn" };
        setCache(cacheKey, result, 2 * 60 * 1000);
        return result;
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
        invalidateCache(`verify:${cleanDomain}`);
      }

      const result = {
        valid: true,
        code: "VALID",
        message: "License hợp lệ",
        license: {
          productName: license.productName,
          domain: license.domain || cleanDomain,
          expiresAt: license.expiresAt,
        },
      };

      setCache(cacheKey, result);
      return result;
    } catch (error: any) {
      return { valid: false, code: "SERVER_ERROR", message: "Lỗi hệ thống" };
    }
  });