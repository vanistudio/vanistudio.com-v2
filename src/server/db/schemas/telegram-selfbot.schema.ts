import { pgTable, text, timestamp, boolean, integer, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const telegramAccounts = pgTable("telegram_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  phone: text("phone").notNull(),
  sessionString: text("session_string").notNull(),
  telegramId: text("telegram_id"),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatar: text("avatar"),
  
  status: text("status").default("active").notNull(),
  proxy: text("proxy"),
  proxyStatus: text("proxy_status").default("unknown").notNull(),
  lastProxyCheckAt: timestamp("last_proxy_check_at", { withTimezone: true }),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const telegramAutoResponders = pgTable("telegram_auto_responders", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => telegramAccounts.id, { onDelete: "cascade" }),
  
  isActive: boolean("is_active").default(true).notNull(),
  replyText: text("reply_text").notNull(),
  detectionMode: text("detection_mode").default("always").notNull(),
  inactivityMinutes: integer("inactivity_minutes").default(10).notNull(),
  
  workDays: jsonb("work_days").$type<number[]>().default([1, 2, 3, 4, 5]).notNull(),
  workStartHour: text("work_start_hour").default("08:00").notNull(),
  workEndHour: text("work_end_hour").default("18:00").notNull(),
  
  cooldownHours: integer("cooldown_hours").default(12).notNull(),
  markAsRead: boolean("mark_as_read").default(false).notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const telegramSelfbotLogs = pgTable("telegram_selfbot_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => telegramAccounts.id, { onDelete: "cascade" }),
  
  actionType: text("action_type").notNull(),
  status: text("status").notNull(),
  message: text("message").notNull(),
  details: jsonb("details"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type TelegramAccount = typeof telegramAccounts.$inferSelect;
export type NewTelegramAccount = typeof telegramAccounts.$inferInsert;

export type TelegramAutoResponder = typeof telegramAutoResponders.$inferSelect;
export type NewTelegramAutoResponder = typeof telegramAutoResponders.$inferInsert;

export type TelegramSelfbotLog = typeof telegramSelfbotLogs.$inferSelect;
export type NewTelegramSelfbotLog = typeof telegramSelfbotLogs.$inferInsert;
