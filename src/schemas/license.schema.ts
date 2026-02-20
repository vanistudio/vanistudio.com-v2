import { pgTable, text, timestamp, boolean, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.schema";
import { products } from "./product.schema";

export const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  status: text("status", { enum: ["active", "expired", "revoked", "unused"] }).default("unused").notNull(),
  notes: text("notes"),
  domain: text("domain"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, {
    fields: [licenses.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [licenses.productId],
    references: [products.id],
  }),
}));

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
