import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schemas/*.schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.APP_POSTGRESQL_URI!,
  },
});
