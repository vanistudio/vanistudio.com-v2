import * as fs from "fs";
import * as path from "path";

// 1. Manually parse and load .env file variables to process.env
const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    const key = parts[0]?.trim();
    const value = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    if (key && value) {
      process.env[key] = value;
    }
  });
}

if (!process.env.APP_DATABASE_URI_VALUE) {
  console.error("Error: APP_DATABASE_URI_VALUE is not defined in .env");
  process.exit(1);
}

// 2. Main function using dynamic imports
async function main() {
  try {
    console.log("Starting database seeding for default blog posts...");

    const { db } = await import("../src/server/db");
    const { blogs } = await import("../src/server/db/schemas/blog.schema");
    const { inArray } = await import("drizzle-orm");
    const { DEFAULT_BLOGS } = await import("../src/defaults/blog.default");

    const blogSlugs = DEFAULT_BLOGS.map(b => b.slug);

    if (blogSlugs.length > 0) {
      console.log("Cleaning up existing matching blog records...");
      await db.delete(blogs).where(inArray(blogs.slug, blogSlugs));

      console.log("Seeding default blogs...");
      await db.insert(blogs).values(DEFAULT_BLOGS);
    } else {
      console.log("No default blogs defined.");
    }

    console.log("Seeding blogs completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding blogs failed:", error);
    process.exit(1);
  }
}

main();
