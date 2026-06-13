import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

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
  sitePrimaryFont: text("site_primary_font").default("Outfit").notNull(),
  siteSecondaryFont: text("site_secondary_font").default("Outfit").notNull(),
  maintenanceMode: jsonb("maintenance_mode").default({ enabled: false, message: "Hệ thống đang bảo trì. Vui lòng quay lại sau!" }).notNull(),
  globalPopup: jsonb("global_popup").default({ enabled: false, htmlContent: "" }).notNull(),
  customCodes: jsonb("custom_codes").default({ head: "", body: "", css: "", js: "" }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;