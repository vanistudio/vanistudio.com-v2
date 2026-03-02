import { Elysia } from "elysia";
import { dashboardController } from "@/controllers/administrator/dashboard.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .use(adminProxy)
  .get("/", async () => {
    try {
      const data = await dashboardController.getOverview();
      return { success: true, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.DASHBOARD_VIEW) });
