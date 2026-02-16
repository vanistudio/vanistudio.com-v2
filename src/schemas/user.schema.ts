import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { licenses } from "./license.schema";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["admin", "user"] }).default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  licenses: many(licenses),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
