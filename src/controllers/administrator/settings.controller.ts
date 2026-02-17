import { db } from "@/configs/index.config";
import { settings } from "@/schemas/setting.schema";
import { eq } from "drizzle-orm";
import { invalidateSettingsCache } from "@/services/settings.service";

export const settingsController = {
  async get() {
    const [row] = await db.select().from(settings).limit(1);
    if (!row) throw new Error("Chưa có cài đặt website");
    return row;
  },

  async update(data: Partial<{
    siteName: string;
    siteTagline: string;
    siteDescription: string;
    siteUrl: string;
    siteLogo: string;
    siteFavicon: string;
    siteLanguage: string;
    siteMetaTitle: string;
    siteMetaDescription: string;
    siteMetaKeywords: string;
    siteMetaAuthor: string;
    siteMetaRobots: string;
    siteCanonicalUrl: string;
    siteOgImage: string;
    siteOgType: string;
    siteOgLocale: string;
    siteGoogleAnalyticsId: string;
    siteGoogleTagManagerId: string;
    siteFacebookPixelId: string;
  }>) {
    const [existing] = await db.select({ id: settings.id }).from(settings).limit(1);
    if (!existing) throw new Error("Chưa có cài đặt website");

    const [updated] = await db.update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.id, existing.id))
      .returning();

    invalidateSettingsCache();
    return updated;
  },
};
