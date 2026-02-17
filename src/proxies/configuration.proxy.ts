import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { settings } from "@/schemas/setting.schema";
import { users } from "@/schemas/user.schema";
import { eq, sql } from "drizzle-orm";

let cachedNeedsSetup: boolean | null = null;

async function checkNeedsSetup(): Promise<boolean> {
  if (cachedNeedsSetup !== null) return cachedNeedsSetup;

  const [settingRow] = await db.select({ id: settings.id }).from(settings).limit(1);
  if (!settingRow) {
    cachedNeedsSetup = true;
    return true;
  }

  const [adminRow] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  cachedNeedsSetup = !adminRow;
  return cachedNeedsSetup;
}

export function invalidateSetupCache() {
  cachedNeedsSetup = null;
}

export const configProxy = new Elysia({ name: "config-proxy" })
  .derive({ as: "global" }, async () => {
    const needsSetup = await checkNeedsSetup();
    return { needsSetup };
  });
