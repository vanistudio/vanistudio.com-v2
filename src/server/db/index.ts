import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as settingSchema from "@/server/db/schemas/setting.schema";
import * as userSchema from "@/server/db/schemas/user.schema";
import * as relationsSchema from "@/server/db/r";

const connectionString = process.env.APP_DATABASE_URI_VALUE;

if (!connectionString) {
  throw new Error("APP_DATABASE_URI_VALUE is not defined in environment variables");
}

const globalForPostgres = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

export const pgClient =
  globalForPostgres.postgresClient ?? postgres(connectionString);

if (process.env.NODE_ENV !== "production") globalForPostgres.postgresClient = pgClient;

export const db = drizzle(pgClient, {
  schema: {
    ...settingSchema,
    ...userSchema,
    ...relationsSchema,
  },
});

export type Database = typeof db;