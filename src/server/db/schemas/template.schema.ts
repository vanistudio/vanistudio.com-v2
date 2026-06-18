import { pgTable, text, timestamp, boolean, uuid, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

export interface TemplateExtraConfig {
  senderName?: string;
  senderEmail?: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2" | "PlainText";
  discordEmbed?: {
    color?: string;
    title?: string;
    authorName?: string;
    authorIcon?: string;
    footerText?: string;
    thumbnailUrl?: string;
  };
  slackBlocks?: Record<string, any>[];
}

export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  eventKey: text("event_key").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  variables: jsonb("variables").$type<string[]>().default([]).notNull(),
  extraConfig: jsonb("extra_config").$type<TemplateExtraConfig>().default({}).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  eventChannelIdx: uniqueIndex("templates_event_channel_idx").on(table.eventKey, table.channel)
}));

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
