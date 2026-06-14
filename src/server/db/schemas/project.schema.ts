import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { services } from "./service.schema";

export interface ProjectContributor {
  name: string;
  role: string;
  avatar?: string | null;
  profileUrl?: string | null;
}

export interface ProjectLink {
  label: string;
  url: string;
  type: "live" | "github" | "figma" | "youtube" | "docs" | "other";
}

export interface ProjectMetric {
  label: string;
  value: string;
  icon?: string | null;
}

export interface ProjectHighlight {
  title: string;
  description: string;
  image?: string | null;
}

export interface ProjectMedia {
  url: string;
  caption?: string | null;
  type: "image" | "video";
}

export interface ProjectTestimonial {
  content: string;
  author: string;
  role: string;
  avatar?: string | null;
}

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content").notNull(),
  thumbnail: text("thumbnail"),
  mediaGallery: jsonb("media_gallery").$type<ProjectMedia[]>().default([]).notNull(),
  projectType: text("project_type").default("personal").notNull(), 
  role: text("role"),
  difficulty: integer("difficulty").default(3).notNull(),
  metrics: jsonb("metrics").$type<ProjectMetric[]>().default([]).notNull(),
  highlights: jsonb("highlights").$type<ProjectHighlight[]>().default([]).notNull(),
  clientName: text("client_name"),
  clientUrl: text("client_url"),
  links: jsonb("links").$type<ProjectLink[]>().default([]).notNull(),
  team: jsonb("team").$type<ProjectContributor[]>().default([]).notNull(),
  testimonials: jsonb("testimonials").$type<ProjectTestimonial[]>().default([]).notNull(),
  status: text("status").default("completed").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  featured: boolean("featured").default(false).notNull(),
  order: integer("order").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  likesCount: integer("likes_count").default(0).notNull(),
  serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
