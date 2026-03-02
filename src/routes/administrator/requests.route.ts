import { Elysia } from "elysia";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";
import { getRequestLogs, getRequestStats, clearRequestLogs } from "@/services/request-logger.service";

export const requestLogRoutes = new Elysia({ prefix: "/requests" })
  .use(adminProxy)
  .get("/", ({ query }) => {
    const limit = parseInt(query?.limit || "200", 10);
    return { success: true, logs: getRequestLogs(limit) };
  }, { beforeHandle: requirePermission(PERMISSIONS.REQUESTS_VIEW) })
  .get("/stats", () => {
    return { success: true, stats: getRequestStats() };
  }, { beforeHandle: requirePermission(PERMISSIONS.REQUESTS_VIEW) })
  .delete("/clear", () => {
    clearRequestLogs();
    return { success: true };
  }, { beforeHandle: requirePermission(PERMISSIONS.REQUESTS_CLEAR) });
