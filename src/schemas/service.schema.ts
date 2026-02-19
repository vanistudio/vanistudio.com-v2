import { pgTable, text, timestamp, uuid, integer, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./category.schema";

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  description: text("description"),
  content: text("content"),
  icon: text("icon"),
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"),
  price: numeric("price", { precision: 12, scale: 0 }).default("0").notNull(),
  minPrice: numeric("min_price", { precision: 12, scale: 0 }),
  maxPrice: numeric("max_price", { precision: 12, scale: 0 }),
  currency: text("currency").default("VND").notNull(),
  priceUnit: text("price_unit"),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft").notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  features: jsonb("features").$type<string[]>().default([]),
  deliverables: jsonb("deliverables").$type<string[]>().default([]),
  estimatedDays: integer("estimated_days"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const servicesRelations = relations(services, ({ one }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
}));

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
