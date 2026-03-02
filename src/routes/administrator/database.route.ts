import { Elysia } from "elysia";
import { databaseController } from "@/controllers/administrator/database.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const databaseRoutes = new Elysia({ prefix: "/database" })
  .use(adminProxy)
  .get("/tables", async () => {
    try {
      const result = await databaseController.getTables();
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.DATABASE_VIEW) });
