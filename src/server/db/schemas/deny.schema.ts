import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const denies = pgTable("denies", {
  id: uuid("id").defaultRandom().primaryKey(),
  ip: text("ip").notNull(),
  reason: text("reason")
    .default("Vi phạm chính sách")
    .notNull(),
  whoBanned: text("who_banned")
    .default("System")
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isp: text("isp"),
  city: text("city"),
  country: text("country"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => {
  return {
    ipIdx: uniqueIndex("idx_denies_ip").on(table.ip),
  };
});

export type Deny = typeof denies.$inferSelect;
export type NewDeny = typeof denies.$inferInsert;
