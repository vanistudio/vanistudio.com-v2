import { Elysia } from "elysia";
import { adminProxy } from "@/proxies/administrator.proxy";
import { getRequestLogs, getRequestStats, clearRequestLogs } from "@/services/request-logger.service";

export const requestLogRoutes = new Elysia({ prefix: "/requests" })
  .use(adminProxy)
  .get("/", ({ query }) => {
    const limit = parseInt(query?.limit || "200", 10);
    return { success: true, logs: getRequestLogs(limit) };
  })
  .get("/stats", () => {
    return { success: true, stats: getRequestStats() };
  })
  .delete("/clear", () => {
    clearRequestLogs();
    return { success: true };
  });
