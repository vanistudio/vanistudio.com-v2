import { Elysia } from "elysia";
import { licenseService } from "@/server/services/license.service";

export const licensePublicRoutes = new Elysia({ prefix: "/license" })
  .get("/verify-domain/:domain", async ({ params }) => {
    try {
      const result = await licenseService.verifyDomain(params.domain);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/activate", async ({ body }) => {
    try {
      const result = await licenseService.activateLicense(body as any);
      return result;
    } catch (error: any) {
      return { valid: false, code: "SERVER_ERROR", message: "Lỗi hệ thống" };
    }
  });
