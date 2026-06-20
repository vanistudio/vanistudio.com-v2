import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user.schema";
import { products } from "./product.schema";

export const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // The user who owns this license key
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
    
  // The product this license belongs to
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  // Unique License Key (e.g. VANI-XXXX-XXXX-XXXX)
  licenseKey: text("license_key").notNull().unique(),

  // Status of the license: active, suspended, expired, revoked
  status: text("status").default("active").notNull(),

  // Allowed domains/servers (useful for Web scripts/Discord bots)
  allowedDomains: jsonb("allowed_domains").$type<string[]>().default([]).notNull(),
  allowedIps: jsonb("allowed_ips").$type<string[]>().default([]).notNull(),

  // Usage limits
  maxActivations: integer("max_activations").default(1).notNull(),
  activationCount: integer("activation_count").default(0).notNull(),

  // Timestamp information
  expiresAt: timestamp("expires_at", { withTimezone: true }), // null = Lifetime
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
