import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { licenses } from "@/schemas/license.schema";
import { eq, and } from "drizzle-orm";

export const licensePublicRoutes = new Elysia({ prefix: "/license" })
  .get("/check/:key", async ({ params }) => {
    try {
      const [license] = await db.select({
        id: licenses.id,
        key: licenses.key,
        productName: licenses.productName,
        status: licenses.status,
        maxActivations: licenses.maxActivations,
        currentActivations: licenses.currentActivations,
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
      }).from(licenses)
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
          expiresAt: license.expiresAt,
          activatedAt: license.activatedAt,
          createdAt: license.createdAt,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
