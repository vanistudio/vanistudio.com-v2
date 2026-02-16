import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as userSchema from "@/schemas/user.schema";
import * as licenseSchema from "@/schemas/license.schema";

const connectionString = process.env.APP_POSTGRESQL_URI;

if (!connectionString) {
  throw new Error("APP_POSTGRESQL_URI is not defined in environment variables");
}

const client = postgres(connectionString);

export const db = drizzle(client, {
  schema: {
    ...userSchema,
    ...licenseSchema,
  },
});

export type Database = typeof db;