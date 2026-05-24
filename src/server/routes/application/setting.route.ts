import { Elysia } from "elysia";
import { getSiteSettings } from "@/server/services/setting.service";

export const settingPublicRoutes = new Elysia({ prefix: "/settings" })
  .get("/", async () => {
    try {
      const settings = await getSiteSettings();
      return { success: true, settings };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
