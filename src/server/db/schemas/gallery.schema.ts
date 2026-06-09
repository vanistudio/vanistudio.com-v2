import { pgTable, text, timestamp, varchar, integer, uuid } from "drizzle-orm/pg-core";

export const gallery = pgTable("gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  size: integer("size").notNull().default(0),
  mediaType: varchar("media_type", { length: 50 }).notNull(),
  storageType: varchar("storage_type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
