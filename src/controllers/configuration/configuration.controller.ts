import { db } from "@/configs/index.config";
import { settings } from "@/schemas/setting.schema";
import { users } from "@/schemas/user.schema";
import { eq } from "drizzle-orm";

async function hasSettings(): Promise<boolean> {
  const [row] = await db.select({ id: settings.id }).from(settings).limit(1);
  return !!row;
}

async function hasAdmin(): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);
  return !!row;
}

export const configController = {
  async getStatus() {
    const [settingsExist, adminExist] = await Promise.all([hasSettings(), hasAdmin()]);
    return {
      needsSetup: !settingsExist || !adminExist,
      hasSettings: settingsExist,
      hasAdmin: adminExist,
    };
  },

  async setupSite(
    userId: string,
    data: {
      siteName: string;
      siteUrl: string;
      siteTagline?: string;
      siteDescription?: string;
      siteLanguage?: string;
      siteMetaTitle?: string;
      siteMetaDescription?: string;
      siteMetaKeywords?: string;
      siteMetaAuthor?: string;
    }
  ) {
    const existing = await hasSettings();
    if (existing) throw new Error("Website đã được cài đặt");

    const [setting] = await db
      .insert(settings)
      .values({
        siteName: data.siteName,
        siteUrl: data.siteUrl,
        siteTagline: data.siteTagline || null,
        siteDescription: data.siteDescription || null,
        siteLanguage: data.siteLanguage || "vi",
        siteMetaTitle: data.siteMetaTitle || data.siteName,
        siteMetaDescription: data.siteMetaDescription || data.siteDescription || null,
        siteMetaKeywords: data.siteMetaKeywords || null,
        siteMetaAuthor: data.siteMetaAuthor || null,
      })
      .returning();

    const [admin] = await db
      .update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();


    return { setting, admin };
  },
};
