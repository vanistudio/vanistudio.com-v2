import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user.schema";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),

  // ── Thông tin cơ bản ──
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  description: text("description"),
  content: text("content"),

  // ── Media ──
  thumbnail: text("thumbnail"),
  coverImage: text("cover_image"),
  images: jsonb("images").$type<string[]>().default([]),
  videoUrl: text("video_url"),

  // ── Links ──
  liveUrl: text("live_url"),
  sourceUrl: text("source_url"),
  figmaUrl: text("figma_url"),

  // ── Phân loại ──
  category: text("category"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  status: text("status", { enum: ["draft", "published", "archived"] }).default("draft").notNull(),
  type: text("type", { enum: ["personal", "freelance", "open-source", "collaboration"] }).default("personal").notNull(),

  // ── Timeline ──
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  isOngoing: boolean("is_ongoing").default(false).notNull(),

  // ── Tác giả ──
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  clientName: text("client_name"),
  role: text("role"),

  // ── Stats ──
  isFeatured: boolean("is_featured").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  // ── SEO ──
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),

  // ── Timestamps ──
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  author: one(users, {
    fields: [projects.authorId],
    references: [users.id],
  }),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
