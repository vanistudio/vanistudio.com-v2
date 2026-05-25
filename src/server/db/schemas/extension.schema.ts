import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const extensions = pgTable("extensions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  config: jsonb("config").default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Extension = typeof extensions.$inferSelect;
export type NewExtension = typeof extensions.$inferInsert;
