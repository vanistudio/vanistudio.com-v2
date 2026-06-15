import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export interface ProductFeature {
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface ChangelogItem {
  version: string;
  date: string;
  title?: string | null;
  changes: string[];
}

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content").notNull(),
  type: text("type").default("source_code").notNull(),
  status: text("status").default("active").notNull(),
  thumbnail: text("thumbnail"),
  gallery: jsonb("gallery").$type<string[]>().default([]).notNull(),
  
  price: integer("price").default(0).notNull(),
  salePrice: integer("sale_price"),
  currency: text("currency").default("USD").notNull(),
  badge: text("badge"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  
  version: text("version").default("1.0.0").notNull(),
  licenseType: text("license_type").default("single").notNull(),
  supportMonths: integer("support_months").default(6).notNull(),
  fileSize: text("file_size"),
  compatibility: jsonb("compatibility").$type<string[]>().default([]).notNull(),
  
  demoUrl: text("demo_url"),
  githubUrl: text("github_url"),
  downloadUrl: text("download_url"),
  
  salesCount: integer("sales_count").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),

  features: jsonb("features").$type<ProductFeature[]>().default([]).notNull(),
  changelog: jsonb("changelog").$type<ChangelogItem[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
