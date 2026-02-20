import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { licenses } from "@/schemas/license.schema";
import { eq } from "drizzle-orm";

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
  });
