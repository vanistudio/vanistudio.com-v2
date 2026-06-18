import { pgTable, text, timestamp, boolean, uuid, integer, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

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

export const apiOverviews = pgTable("api_overviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  apiType: text("api_type").notNull().default("default"),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  thumbnail: text("thumbnail"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugTypeIdx: uniqueIndex("api_overviews_slug_type_idx").on(table.slug, table.apiType)
}));

export const apiGroups = pgTable("api_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  apiType: text("api_type").notNull().default("default"),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugTypeIdx: uniqueIndex("api_groups_slug_type_idx").on(table.slug, table.apiType)
}));

export const apiEndpoints = pgTable("api_endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => apiGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  method: text("method").notNull(),
  path: text("path").notNull(),
  description: text("description").notNull(),
  headers: jsonb("headers").$type<ApiParameter[]>().default([]).notNull(),
  queryParams: jsonb("query_params").$type<ApiParameter[]>().default([]).notNull(),
  requestBody: jsonb("request_body").$type<ApiParameter[]>().default([]).notNull(),
  responses: jsonb("responses").$type<ApiResponseSample[]>().default([]).notNull(),
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

export const apiProducts = pgTable("api_products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ApiProduct = typeof apiProducts.$inferSelect;
export type NewApiProduct = typeof apiProducts.$inferInsert;
