import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export interface ApiParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description: string;
  placeholder?: string;
  defaultValue?: any;
}

export interface ApiResponseSample {
  status: number;
  description: string;
  body: Record<string, any> | string;
}

// Bảng tài liệu hướng dẫn tổng quan (tương tự blog.schema.ts)
export const apiOverviews = pgTable("api_overviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content").notNull(), // Nội dung MDX
  thumbnail: text("thumbnail"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Bảng gom nhóm các API Endpoint
export const apiGroups = pgTable("api_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Bảng tài liệu chi tiết các API Endpoint
export const apiEndpoints = pgTable("api_endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => apiGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  method: text("method").notNull(), // GET, POST, PUT, DELETE, PATCH
  path: text("path").notNull(), // Ví dụ: /api/products
  description: text("description").notNull(), // Nội dung MDX mô tả API
  headers: jsonb("headers").$type<ApiParameter[]>().default([]).notNull(),
  queryParams: jsonb("query_params").$type<ApiParameter[]>().default([]).notNull(),
  requestBody: jsonb("request_body").$type<ApiParameter[]>().default([]).notNull(),
  responses: jsonb("responses").$type<ApiResponseSample[]>().default([]).notNull(),
  editionRequired: jsonb("edition_required").$type<string[]>().default(["standard", "premium", "ultimate"]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ApiOverview = typeof apiOverviews.$inferSelect;
export type NewApiOverview = typeof apiOverviews.$inferInsert;

export type ApiGroup = typeof apiGroups.$inferSelect;
export type NewApiGroup = typeof apiGroups.$inferInsert;

export type ApiEndpoint = typeof apiEndpoints.$inferSelect;
export type NewApiEndpoint = typeof apiEndpoints.$inferInsert;
