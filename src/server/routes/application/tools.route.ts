import { Elysia } from "elysia";
import { toolService } from "@/server/io/tool.io";

export const toolsPublicRoutes = new Elysia({ prefix: "/tools" })
  .get("/check-id", async ({ query }) => {
    try {
      const target = query.target;
      if (!target) return { success: false, error: "Thiếu target" };

      const result = await toolService.checkId(target);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/check-live-uid", async ({ body }) => {
    try {
      const { uids } = body as { uids: string[] };
      const { results } = await toolService.checkLiveUid(uids);
      return { success: true, results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/check-domain", async ({ query }) => {
    try {
      const domain = query.domain;
      if (!domain) return { success: false, error: "Thiếu domain" };

      const { result } = await toolService.checkDomain(domain);
      return { success: true, result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
