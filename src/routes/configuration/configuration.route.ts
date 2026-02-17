import { Elysia, t } from "elysia";
import { configController } from "@/controllers/configuration/configuration.controller";
import { authProxy } from "@/proxies/authentication.proxy";

export const configRoutes = new Elysia({ prefix: "/api/config" })
  .use(authProxy)
  .get("/status", async () => {
    return configController.getStatus();
  })
  .post("/setup", async ({ body, auth }) => {
    if (!auth) return { success: false, error: "Bạn cần đăng nhập trước khi cài đặt" };

    try {
      const { setting, admin } = await configController.setupSite(auth.userId, body);
      return { success: true, setting, admin: { id: admin.id, role: admin.role } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    body: t.Object({
      siteName: t.String({ minLength: 1, maxLength: 200 }),
      siteUrl: t.String({ minLength: 1, maxLength: 500 }),
      siteTagline: t.Optional(t.String({ maxLength: 300 })),
      siteDescription: t.Optional(t.String({ maxLength: 1000 })),
      siteLanguage: t.Optional(t.String({ maxLength: 10 })),
      siteMetaTitle: t.Optional(t.String({ maxLength: 200 })),
      siteMetaDescription: t.Optional(t.String({ maxLength: 500 })),
      siteMetaKeywords: t.Optional(t.String({ maxLength: 500 })),
      siteMetaAuthor: t.Optional(t.String({ maxLength: 200 })),
    }),
  });
