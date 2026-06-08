import { pgTable, text, timestamp, boolean, integer, uuid, AnyPgColumn } from "drizzle-orm/pg-core";

export const menuGroups = pgTable("menu_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const menus = pgTable("menus", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => menuGroups.id, { onDelete: "cascade" }).notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => menus.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url"),
  icon: text("icon"),
  order: integer("order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type MenuGroup = typeof menuGroups.$inferSelect;
export type NewMenuGroup = typeof menuGroups.$inferInsert;

export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
