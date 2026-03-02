import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { settings } from "@/schemas/setting.schema";
import { users } from "@/schemas/user.schema";
import { roles } from "@/schemas/role.schema";
import { eq, or, and, isNotNull } from "drizzle-orm";

async function checkNeedsSetup(): Promise<boolean> {
  const [settingRow] = await db.select({ id: settings.id }).from(settings).limit(1);
  if (!settingRow) return true;

  // Check if at least one user has admin-level access (via roleId with "*" or legacy role="admin")
  const [adminRow] = await db
    .select({ id: users.id })
    .from(users)
    .where(or(
      eq(users.role, "admin"),
      isNotNull(users.roleId)
    ))
    .limit(1);

  return !adminRow;
}

export const configProxy = new Elysia({ name: "config-proxy" })
  .derive({ as: "global" }, async () => {
    const needsSetup = await checkNeedsSetup();
    return { needsSetup };
  });

