import { db } from "@/configs/index.config";
import { settings } from "@/schemas/setting.schema";

let cachedSettings: Record<string, string> | null = null;

export async function getSiteSettings(): Promise<Record<string, string>> {
  if (cachedSettings) return cachedSettings;

  const [row] = await db.select().from(settings).limit(1);
  if (!row) {
    return {
      siteName: "Vani Studio",
      siteUrl: "",
      siteTagline: "",
      siteDescription: "",
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
      siteCustomHeadCode: "",
      siteCustomBodyCode: "",
    };
  }

  cachedSettings = {
    siteName: row.siteName || "",
    siteUrl: row.siteUrl || "",
    siteTagline: row.siteTagline || "",
    siteDescription: row.siteDescription || "",
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
    siteCustomHeadCode: row.siteCustomHeadCode || "",
    siteCustomBodyCode: row.siteCustomBodyCode || "",
  };

  return cachedSettings;
}

export function invalidateSettingsCache() {
  cachedSettings = null;
}
