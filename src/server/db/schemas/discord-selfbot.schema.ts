import { pgTable, text, timestamp, boolean, jsonb, integer, uuid } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export const discordAccountGroups = pgTable("discord_account_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discordAccounts = pgTable("discord_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  email: text("email"),
  password: text("password"),
  twoFactorSecret: text("two_factor_secret"),
  backupCodes: jsonb("backup_codes").$type<string[]>().default([]).notNull(),
  discordId: text("discord_id"),
  username: text("username"),
  discriminator: text("discriminator"),
  globalName: text("global_name"),
  avatar: text("avatar"),
  banner: text("banner"),
  accentColor: text("accent_color"),
  status: text("status").default("active").notNull(),
  phone: text("phone"),
  hasMfa: boolean("has_mfa").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  nitroType: text("nitro_type").default("None").notNull(),
  proxy: text("proxy"),
  proxyStatus: text("proxy_status").default("unknown").notNull(),
  lastProxyCheckAt: timestamp("last_proxy_check_at", { withTimezone: true }),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  clientSettings: jsonb("client_settings").$type<{
    userAgent?: string;
    browser?: string;
    os?: string;
    osVersion?: string;
    browserVersion?: string;
    device?: string;
    locale?: string;
    releaseChannel?: "stable" | "ptb" | "canary";
    clientBuildNumber?: number;
    capabilities?: number;
  }>().default({}).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),   
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discordAccountGroupMappings = pgTable("discord_account_group_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => discordAccounts.id, { onDelete: "cascade" }),
  groupId: uuid("group_id")
    .notNull()
    .references(() => discordAccountGroups.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discordPresencePresets = pgTable("discord_presence_presets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  onlineStatus: text("online_status").default("online").notNull(),
  customStatusText: text("custom_status_text"),
  customStatusEmoji: text("custom_status_emoji"),
  customStatusExpiry: text("custom_status_expiry"),
  activities: jsonb("activities").$type<Array<{
    type: number;
    name: string;
    applicationId?: string;
    details?: string;
    state?: string;
    largeImageKey?: string;
    largeText?: string;
    smallImageKey?: string;
    smallText?: string;
    party?: {
      id?: string;
      current?: number;
      max?: number;
    };
    timestamps?: {
      start?: number;
      end?: number;
    };
    buttons?: Array<{ label: string; url: string }>;
    streamUrl?: string;
  }>>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discordPresenceRotators = pgTable("discord_presence_rotators", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  intervalSeconds: integer("interval_seconds").default(300).notNull(),
  presetIds: jsonb("preset_ids").$type<string[]>().default([]).notNull(),
  randomize: boolean("randomize").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discordSelfbotAutomations = pgTable("discord_selfbot_automations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  triggerType: text("trigger_type").notNull(),
  triggerConfig: jsonb("trigger_config").$type<{
    cron?: string;
    intervalMinutes?: number;
    eventName?: string;
    targetAccountIds?: string[]; 
  }>().notNull(),
  actions: jsonb("actions").$type<Array<{
    actionType: string;
    config: Record<string, any>; 
  }>>().default([]).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discordSelfbotSessions = pgTable("discord_selfbot_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => discordAccounts.id, { onDelete: "cascade" })
    .unique(),
  isRunning: boolean("is_running").default(false).notNull(),
  mode: text("mode").default("static_preset").notNull(),
  activePresetId: uuid("active_preset_id").references(() => discordPresencePresets.id, { onDelete: "set null" }),
  activeRotatorId: uuid("active_rotator_id").references(() => discordPresenceRotators.id, { onDelete: "set null" }),
  workerPid: integer("worker_pid"), 
  lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const discordSelfbotLogs = pgTable("discord_selfbot_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  accountId: uuid("account_id")
    .notNull()
    .references(() => discordAccounts.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(), 
  status: text("status").notNull(),
  message: text("message").notNull(), 
  details: jsonb("details"), 
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DiscordAccountGroup = typeof discordAccountGroups.$inferSelect;
export type DiscordAccount = typeof discordAccounts.$inferSelect;
export type DiscordPresencePreset = typeof discordPresencePresets.$inferSelect;
export type DiscordPresenceRotator = typeof discordPresenceRotators.$inferSelect;
export type DiscordSelfbotAutomation = typeof discordSelfbotAutomations.$inferSelect;
export type DiscordSelfbotSession = typeof discordSelfbotSessions.$inferSelect;
export type DiscordSelfbotLog = typeof discordSelfbotLogs.$inferSelect;