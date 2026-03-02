import { Elysia, t } from "elysia";
import { settingsController } from "@/controllers/administrator/settings.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const settingsRoutes = new Elysia({ prefix: "/settings" })
  .use(adminProxy)
  .get("/", async () => {
    try {
      const settings = await settingsController.get();
      return { success: true, settings };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.SETTINGS_VIEW) })
  .patch("/", async ({ body }) => {
    try {
      const settings = await settingsController.update(body);
      return { success: true, settings };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    beforeHandle: requirePermission(PERMISSIONS.SETTINGS_UPDATE),
    body: t.Partial(t.Object({
      siteName: t.String(),
      siteTagline: t.String(),
      siteDescription: t.String(),
      siteUrl: t.String(),
      siteLogo: t.String(),
      siteFavicon: t.String(),
      siteLanguage: t.String(),
      siteMetaTitle: t.String(),
      siteMetaDescription: t.String(),
      siteMetaKeywords: t.String(),
      siteMetaAuthor: t.String(),
      siteMetaRobots: t.String(),
      siteCanonicalUrl: t.String(),
      siteOgImage: t.String(),
      siteOgType: t.String(),
      siteOgLocale: t.String(),
      siteGoogleAnalyticsId: t.String(),
      siteGoogleTagManagerId: t.String(),
      siteFacebookPixelId: t.String(),
    })),
  });
