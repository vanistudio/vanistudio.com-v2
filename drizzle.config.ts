import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schemas/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.APP_DATABASE_URI_VALUE || "postgresql://postgres:postgres@localhost:5432/vanistudio",
  },
});
