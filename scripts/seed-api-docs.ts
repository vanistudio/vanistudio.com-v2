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

async function main() {
  try {
    console.log("Starting database seeding for 45 API Endpoints...");

    // Dynamically import apiService
    const { apiService } = await import("../src/server/services/administrator/api.service");

    await apiService.seedApiDocs();

    console.log("Database seeding for 45 Endpoints finished successfully!");
    process.exit(0);
  } catch (error: any) {
    console.error("Error seeding API Docs data:", error);
    process.exit(1);
  }
}

main();
