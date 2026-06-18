import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as settingSchema from "@/server/db/schemas/setting.schema";
import * as userSchema from "@/server/db/schemas/user.schema";
import * as extensionSchema from "@/server/db/schemas/extension.schema";
import * as menuSchema from "@/server/db/schemas/menu.schema";
import * as relationsSchema from "@/server/db/r";
import * as denySchema from "@/server/db/schemas/deny.schema";
import * as cmsPageSchema from "@/server/db/schemas/cms-page.schema";
import * as blogSchema from "@/server/db/schemas/blog.schema";
import * as gallerySchema from "@/server/db/schemas/gallery.schema";
import * as serviceSchema from "@/server/db/schemas/service.schema";
import * as projectSchema from "@/server/db/schemas/project.schema";
import * as productSchema from "@/server/db/schemas/product.schema";
import * as templateSchema from "@/server/db/schemas/template.schema";
import * as notificationSchema from "@/server/db/schemas/notification.schema";

const connectionString = process.env.APP_DATABASE_URI_VALUE;

if (!connectionString) {
  throw new Error("APP_DATABASE_URI_VALUE is not defined in environment variables");
}

const globalForPostgres = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

export const pgClient =
  globalForPostgres.postgresClient ?? postgres(connectionString, { connect_timeout: 3 });

if (process.env.NODE_ENV !== "production") globalForPostgres.postgresClient = pgClient;

export const db = drizzle(pgClient, {
  schema: {
    ...settingSchema,
    ...userSchema,
    ...extensionSchema,
    ...relationsSchema,
    ...menuSchema,
    ...denySchema,
    ...cmsPageSchema,
    ...blogSchema,
    ...gallerySchema,
    ...serviceSchema,
    ...projectSchema,
    ...productSchema,
    ...templateSchema,
    ...notificationSchema,
  },
});

export type Database = typeof db;