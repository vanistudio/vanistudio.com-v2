import { pgTable, text, timestamp, boolean, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { users } from "./user.schema";

export interface FormFieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "checkbox" | "number" | "file";
  required: boolean;
  placeholder?: string | null;
  options?: string[] | null;
  defaultValue?: any;
}

export const serviceTypes = pgTable("service_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  icon: text("icon"),
  description: text("description"),
  color: text("color"),
  bg: text("bg"),
  border: text("border"),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type"),
  typeId: uuid("type_id").references(() => serviceTypes.id, { onDelete: "set null" }),
  description: text("description"),
  content: text("content").notNull(),
  thumbnail: text("thumbnail"),
  gallery: jsonb("gallery").$type<string[]>().default([]).notNull(),
  features: jsonb("features").$type<{ name: string; description?: string | null; icon?: string | null }[]>().default([]).notNull(),
  technologies: jsonb("technologies").$type<string[]>().default([]).notNull(),
  basePrice: integer("base_price").default(0).notNull(),
  priceType: text("price_type").default("starting_at").notNull(),
  deliveryTime: integer("delivery_time"),
  status: text("status").default("active").notNull(),
  order: integer("order").default(0).notNull(),
  fieldsConfig: jsonb("fields_config").$type<FormFieldConfig[]>().default([]).notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
export const servicePackages = pgTable("service_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  deliveryTime: integer("delivery_time").notNull(),
  featuresIncluded: jsonb("features_included").$type<Record<string, any>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  packageId: uuid("package_id").references(() => servicePackages.id, { onDelete: "set null" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerSocial: text("customer_social").notNull(),
  requirements: text("requirements"),
  specifications: jsonb("specifications").$type<Record<string, any>>().default({}).notNull(),
  status: text("status").default("pending").notNull(),
  price: integer("price"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;

export type ServicePackage = typeof servicePackages.$inferSelect;
export type NewServicePackage = typeof servicePackages.$inferInsert;

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;
