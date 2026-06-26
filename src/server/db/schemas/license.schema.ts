import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { products } from "./product.schema";

export const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  licenseKey: text("license_key").notNull().unique(),
  status: text("status").default("not_activated").notNull(),
  allowedDomains: jsonb("allowed_domains").$type<string[]>().default([]).notNull(),
  allowedIps: jsonb("allowed_ips").$type<string[]>().default([]).notNull(),
  maxActivations: integer("max_activations").default(1).notNull(),
  activationCount: integer("activation_count").default(0).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
