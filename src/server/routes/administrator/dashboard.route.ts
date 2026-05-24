import { Elysia } from "elysia";
import { dashboardService } from "@/server/services/dashboard.service";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const dashboardRoutes = new Elysia({ prefix: "/dashboard" })
  .use(adminProxy)
  .get("/", async () => {
    try {
      const data = await dashboardService.getOverview();
      return { success: true, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.DASHBOARD_VIEW) });
