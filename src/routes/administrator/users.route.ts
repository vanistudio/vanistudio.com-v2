import { Elysia, t } from "elysia";
import { usersController } from "@/controllers/administrator/users.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await usersController.getUsers({
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
      const user = await usersController.toggleActive(params.id, admin!.userId);
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.USERS_TOGGLE_ACTIVE) })
  .patch("/:id/role", async ({ params, body, admin }) => {
    try {
      const user = await usersController.updateRole(params.id, body.roleId, admin!.userId);
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
      await usersController.deleteUser(params.id, admin!.userId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.USERS_DELETE) });
