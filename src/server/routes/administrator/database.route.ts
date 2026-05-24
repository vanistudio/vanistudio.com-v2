import { Elysia } from "elysia";
import { databaseService } from "@/server/services/database.service";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const databaseRoutes = new Elysia({ prefix: "/database" })
  .use(adminProxy)
  .get("/tables", async () => {
    try {
      const result = await databaseService.getTables();
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.DATABASE_VIEW) });
