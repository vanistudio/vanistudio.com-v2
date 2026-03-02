import { db } from "@/configs/index.config";
import { roles } from "@/schemas/role.schema";
import { eq } from "drizzle-orm";

/**
 * Seed default roles nếu chưa tồn tại.
 * - admin: toàn quyền ("*")
 * - user: không có quyền admin nào
 */
export async function seedDefaultRoles() {
  const existing = await db.select({ name: roles.name }).from(roles);
  const existingNames = existing.map((r) => r.name);

  if (!existingNames.includes("admin")) {
    await db.insert(roles).values({
      name: "admin",
      description: "Quản trị viên - Toàn quyền",
      permissions: ["*"],
      isSystem: true,
    });
    console.log("🔐 Tạo role mặc định: admin");
  }

  if (!existingNames.includes("user")) {
    await db.insert(roles).values({
      name: "user",
      description: "Người dùng thông thường",
      permissions: [],
      isSystem: true,
    });
    console.log("🔐 Tạo role mặc định: user");
  }
}

/**
 * Lấy role admin (đảm bảo tồn tại, dùng khi gán cho user).
 */
export async function getAdminRoleId(): Promise<string | null> {
  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "admin"))
    .limit(1);
  return role?.id || null;
}

/**
 * Lấy role user mặc định.
 */
export async function getUserRoleId(): Promise<string | null> {
  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, "user"))
    .limit(1);
  return role?.id || null;
}
