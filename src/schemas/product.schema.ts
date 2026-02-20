import { pgTable, text, timestamp, uuid, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./category.schema";
import { users } from "./user.schema";

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  description: text("description"),
  content: text("content"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  type: text("type", { enum: ["free", "premium", "enterprise"] }).default("premium").notNull(),
  status: text("status", { enum: ["draft", "published", "archived", "discontinued"] }).default("draft").notNull(),
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"),
  images: jsonb("images").$type<string[]>().default([]),
  videoUrl: text("video_url"),
  demoUrl: text("demo_url"),
  sourceUrl: text("source_url"),
  documentationUrl: text("documentation_url"),
  changelogUrl: text("changelog_url"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  frameworks: jsonb("frameworks").$type<string[]>().default([]),
  price: numeric("price", { precision: 12, scale: 0 }).default("0").notNull(),
  salePrice: numeric("sale_price", { precision: 12, scale: 0 }),
  currency: text("currency").default("VND").notNull(),
  version: text("version").default("1.0.0"),
  compatibility: text("compatibility"),
  requirements: text("requirements"),
  fileSize: text("file_size"),
  lastUpdatedVersion: timestamp("last_updated_version", { withTimezone: true }),
  viewCount: integer("view_count").default(0).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  purchaseCount: integer("purchase_count").default(0).notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).default("0"),
  ratingCount: integer("rating_count").default(0).notNull(),
  features: jsonb("features").$type<string[]>().default([]),
  highlights: jsonb("highlights").$type<{ icon: string; title: string; description: string }[]>().default([]),
  warrantyMonths: integer("warranty_months").default(3),
  supportEmail: text("support_email"),
  supportIncluded: boolean("support_included").default(true).notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [products.authorId],
    references: [users.id],
  }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
