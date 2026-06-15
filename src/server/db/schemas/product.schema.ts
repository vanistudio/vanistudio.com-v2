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
  content: text("content").notNull(), // Detailed documentation/description in MDX/Markdown
  type: text("type").default("source_code").notNull(), // 'source_code' | 'tool' | 'app' | 'bot' | 'extension'
  status: text("status").default("active").notNull(), // 'active' | 'draft' | 'archived'
  thumbnail: text("thumbnail"),
  gallery: jsonb("gallery").$type<string[]>().default([]).notNull(), // Array of image/screenshot URLs
  
  // Pricing & Currency
  price: integer("price").default(0).notNull(), // Regular price (stored as minor units, e.g., cents or full VND depending on currency)
  salePrice: integer("sale_price"), // Discounted/sale price (null if no discount active)
  currency: text("currency").default("USD").notNull(), // 'USD' | 'VND' | 'EUR' etc.
  badge: text("badge"), // Visual badge: 'HOT' | 'NEW' | 'SALE' | 'BETA' etc.
  isFeatured: boolean("is_featured").default(false).notNull(), // Highlighted product
  
  // Software Specifications & Licensing
  version: text("version").default("1.0.0").notNull(), // Current release version (e.g., '1.0.0')
  licenseType: text("license_type").default("single").notNull(), // 'single' | 'extended' | 'subscription' | 'free'
  supportMonths: integer("support_months").default(6).notNull(), // Standard support duration included in months
  fileSize: text("file_size"), // Optional size indicator: e.g., "15.4 MB" or "102 KB"
  compatibility: jsonb("compatibility").$type<string[]>().default([]).notNull(), // Supported frameworks/runtimes: e.g., ["Node.js 20+", "Next.js 16"]
  
  // URLs & Resources
  demoUrl: text("demo_url"), // Live preview / demonstration URL
  githubUrl: text("github_url"), // Showcase repository link
  downloadUrl: text("download_url"), // Direct link to download package or zip file
  
  // Statistics & Metrics
  salesCount: integer("sales_count").default(0).notNull(), // Total number of successful purchases
  viewsCount: integer("views_count").default(0).notNull(), // Page view counter for analytical sorting
  downloadCount: integer("download_count").default(0).notNull(), // Total download hits

  // Rich JSON Configurations
  features: jsonb("features").$type<ProductFeature[]>().default([]).notNull(), // Major features checklist
  changelog: jsonb("changelog").$type<ChangelogItem[]>().default([]).notNull(), // Array of version updates
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(), // Dynamic gateway or custom configurations
  
  order: integer("order").default(0).notNull(), // Ordering index for displays
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
