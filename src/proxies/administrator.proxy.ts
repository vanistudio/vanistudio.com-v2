import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { users } from "@/schemas/user.schema";
import { roles } from "@/schemas/role.schema";
import { eq } from "drizzle-orm";
import { authProxy } from "./authentication.proxy";
import { hasPermission } from "@/constants/permissions";

export const adminProxy = new Elysia({ name: "admin-proxy" })
  .use(authProxy)
  .derive({ as: "global" }, async ({ auth }) => {
    if (!auth) return { admin: null };

    const [user] = await db
      .select({
        id: users.id,
        role: users.role,
        roleId: users.roleId,
      })
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    if (!user) return { admin: null };

    // Lấy permissions từ role
    let permissions: string[] = [];
    if (user.roleId) {
      const [role] = await db
        .select({ permissions: roles.permissions })
        .from(roles)
        .where(eq(roles.id, user.roleId))
        .limit(1);
      if (role) permissions = role.permissions;
    }

    // Fallback: nếu user chưa có roleId nhưng role cũ = "admin" → toàn quyền
    if (!user.roleId && user.role === "admin") {
      permissions = ["*"];
    }

    // Chỉ cho phép nếu có ít nhất 1 permission
    if (permissions.length === 0) return { admin: null };

    return {
      admin: {
        userId: user.id,
        role: user.role,
        roleId: user.roleId,
        permissions,
      },
    };
  })
  .onBeforeHandle(({ admin, set }) => {
    if (!admin) {
      set.status = 403;
      return { success: false, error: "Bạn không có quyền truy cập" };
    }
  });

/**
 * Middleware factory: kiểm tra permission cụ thể.
 * Sử dụng: .onBeforeHandle(requirePermission("products.view"))
 */
export function requirePermission(permission: string) {
  return ({ admin, set }: any) => {
    if (!admin || !hasPermission(admin.permissions, permission)) {
      set.status = 403;
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }
  };
}
