import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteName: text("site_name").notNull(),
  siteUrl: text("site_url").notNull(),
  siteLogo: text("site_logo"),
  siteFavicon: text("site_favicon"),
  siteMetaDescription: text("site_meta_description"),
  siteMetaKeywords: text("site_meta_keywords"),
  siteMetaAuthor: text("site_meta_author"),
  siteOgImage: text("site_og_image"),
  siteColor: text("site_color").default("#7c3aed").notNull(),
  siteTimezone: text("site_timezone").default("Asia/Ho_Chi_Minh").notNull(),
  siteLanguage: text("site_language").default("vi").notNull(),
  siteCurrency: text("site_currency").default("VND").notNull(),
  siteFontConfig: jsonb("site_font_config").$type<{
    primaryFont: string;
    secondaryFont?: string;
    fontWeights: string[];
  }>().default(
    sql`'{"primaryFont": "Signika", "secondaryFont": "", "fontWeights": ["400", "500", "600", "700"]}'::jsonb`
  ),
  siteMaintenanceMode: jsonb("site_maintenance_mode").default({ enabled: false, message: "Hệ thống đang bảo trì. Vui lòng quay lại sau!" }).notNull(),
  siteGlobalPopup: jsonb("site_global_popup").default({ enabled: false, htmlContent: "" }).notNull(),
  siteCustomCodes: jsonb("site_custom_codes").default({ head: "", body: "", css: "", js: "" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;