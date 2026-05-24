import { Elysia } from "elysia";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";
import { uploadService } from "@/server/services/upload.service";

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .use(adminProxy)
  .post("/image", async ({ body }) => {
    try {
      const file = (body as any).file;
      return await uploadService.uploadImage(file);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.UPLOADS_CREATE) });
