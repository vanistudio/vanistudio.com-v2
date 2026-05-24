import { Elysia } from "elysia";
import { authProxy } from "./authentication.proxy";
import { hasPermission } from "@/constants/permissions";
import { authenticationService } from "@/server/services/authentication.service";

export const adminProxy = new Elysia({ name: "admin-proxy" })
  .use(authProxy)
  .derive({ as: "global" }, async ({ auth }) => {
    if (!auth) return { admin: null };

    const user = await authenticationService.getMe(auth.userId);
    if (!user) return { admin: null };

    const permissions = user.permissions || [];
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
export function requirePermission(permission: string) {
  return ({ admin, set }: any) => {
    if (!admin || !hasPermission(admin.permissions, permission)) {
      set.status = 403;
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }
  };
}
