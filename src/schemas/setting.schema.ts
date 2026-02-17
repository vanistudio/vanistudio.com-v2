import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: uuid("id").defaultRandom().primaryKey(),

  // ── Thông tin cơ bản ──
  siteName: text("site_name").notNull(),
  siteTagline: text("site_tagline"),
  siteDescription: text("site_description"),
  siteUrl: text("site_url").notNull(),
  siteLogo: text("site_logo"),
  siteFavicon: text("site_favicon"),
  siteLanguage: text("site_language").default("vi").notNull(),

  // ── SEO Meta ──
  siteMetaTitle: text("site_meta_title"),
  siteMetaDescription: text("site_meta_description"),
  siteMetaKeywords: text("site_meta_keywords"),
  siteMetaAuthor: text("site_meta_author"),
  siteMetaRobots: text("site_meta_robots").default("index, follow"),
  siteCanonicalUrl: text("site_canonical_url"),

  // ── Open Graph / Social Sharing ──
  siteOgImage: text("site_og_image"),
  siteOgType: text("site_og_type").default("website"),
  siteOgLocale: text("site_og_locale").default("vi_VN"),

  // ── Analytics ──
  siteGoogleAnalyticsId: text("site_google_analytics_id"),
  siteGoogleTagManagerId: text("site_google_tag_manager_id"),
  siteFacebookPixelId: text("site_facebook_pixel_id"),

  // ── Nâng cao ──
  siteCustomHeadCode: text("site_custom_head_code"),
  siteCustomBodyCode: text("site_custom_body_code"),

  // ── Timestamps ──
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
