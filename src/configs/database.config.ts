import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as userSchema from "@/schemas/user.schema";
import * as licenseSchema from "@/schemas/license.schema";
import * as settingSchema from "@/schemas/setting.schema";
import * as categorySchema from "@/schemas/category.schema";
import * as productSchema from "@/schemas/product.schema";
import * as blogSchema from "@/schemas/blog.schema";
import * as projectSchema from "@/schemas/project.schema";

const connectionString = process.env.APP_POSTGRESQL_URI;

if (!connectionString) {
  throw new Error("APP_POSTGRESQL_URI is not defined in environment variables");
}

const client = postgres(connectionString);
export const pgClient = client;

export const db = drizzle(client, {
  schema: {
    ...userSchema,
    ...licenseSchema,
    ...settingSchema,
    ...categorySchema,
    ...productSchema,
    ...blogSchema,
    ...projectSchema,
  },
});

export type Database = typeof db;