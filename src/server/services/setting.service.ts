import { settingRepository } from "@/server/repositories/setting.repository";

let cachedSettings: Record<string, string> | null = null;

export async function getSiteSettings(): Promise<Record<string, string>> {
  if (cachedSettings) return cachedSettings;

  const row = await settingRepository.get();
  if (!row) {
    return {
      siteName: "Vani Studio",
      siteUrl: "",
      siteTagline: "",
      siteDescription: "",
      siteLogo: "",
      siteFavicon: "",
      siteLanguage: "vi",
      siteMetaTitle: "Vani Studio",
      siteMetaDescription: "",
      siteMetaKeywords: "",
      siteMetaAuthor: "",
      siteMetaRobots: "index, follow",
      siteCanonicalUrl: "",
      siteOgImage: "",
      siteOgType: "website",
      siteOgLocale: "vi_VN",
      siteGoogleAnalyticsId: "",
      siteGoogleTagManagerId: "",
      siteFacebookPixelId: "",
      contactEmail: "",
      contactPhone: "",
      contactAddress: "",
      socialFacebook: "",
      socialGithub: "",
      socialYoutube: "",
      socialZalo: "",
      socialTelegram: "",
    };
  }

  cachedSettings = {
    siteName: row.siteName || "",
    siteUrl: row.siteUrl || "",
    siteTagline: row.siteTagline || "",
    siteDescription: row.siteDescription || "",
    siteLogo: row.siteLogo || "",
    siteFavicon: row.siteFavicon || "",
    siteLanguage: row.siteLanguage || "vi",
    siteMetaTitle: row.siteMetaTitle || row.siteName || "",
    siteMetaDescription: row.siteMetaDescription || row.siteDescription || "",
    siteMetaKeywords: row.siteMetaKeywords || "",
    siteMetaAuthor: row.siteMetaAuthor || "",
    siteMetaRobots: row.siteMetaRobots || "index, follow",
    siteCanonicalUrl: row.siteCanonicalUrl || row.siteUrl || "",
    siteOgImage: row.siteOgImage || "",
    siteOgType: row.siteOgType || "website",
    siteOgLocale: row.siteOgLocale || "vi_VN",
    siteGoogleAnalyticsId: row.siteGoogleAnalyticsId || "",
    siteGoogleTagManagerId: row.siteGoogleTagManagerId || "",
    siteFacebookPixelId: row.siteFacebookPixelId || "",
    contactEmail: row.contactEmail || "",
    contactPhone: row.contactPhone || "",
    contactAddress: row.contactAddress || "",
    socialFacebook: row.socialFacebook || "",
    socialGithub: row.socialGithub || "",
    socialYoutube: row.socialYoutube || "",
    socialZalo: row.socialZalo || "",
    socialTelegram: row.socialTelegram || "",
  };

  return cachedSettings;
}

export function invalidateSettingsCache() {
  cachedSettings = null;
}

export const settingService = {
  async get() {
    const row = await settingRepository.get();
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
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    socialFacebook: string;
    socialGithub: string;
    socialYoutube: string;
    socialZalo: string;
    socialTelegram: string;
  }>) {
    const existing = await settingRepository.get();
    if (!existing) throw new Error("Chưa có cài đặt website");

    const updated = await settingRepository.update(existing.id, {
      ...data,
      updatedAt: new Date(),
    });

    invalidateSettingsCache();
    return updated;
  },
};
