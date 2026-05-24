import { Elysia, t } from "elysia";
import { userService } from "@/server/services/user.service";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await userService.getUsers({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        search: query.search || undefined,
        role: query.role || undefined,
        sortBy: query.sortBy || undefined,
        sortOrder: query.sortOrder || undefined,
      });
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.USERS_VIEW) })
  .patch("/:id/toggle-active", async ({ params, admin }) => {
    try {
      const user = await userService.toggleActive(params.id, admin!.userId);
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.USERS_TOGGLE_ACTIVE) })
  .patch("/:id/role", async ({ params, body, admin }) => {
    try {
      const user = await userService.updateRole(params.id, { roleId: body.roleId }, admin!.userId);
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    beforeHandle: requirePermission(PERMISSIONS.USERS_UPDATE_ROLE),
    body: t.Object({
      roleId: t.String(),
    }),
  })
  .delete("/:id", async ({ params, admin }) => {
    try {
      await userService.deleteUser(params.id, admin!.userId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.USERS_DELETE) });
