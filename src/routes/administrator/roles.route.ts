import { Elysia, t } from "elysia";
import { rolesController } from "@/controllers/administrator/roles.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const rolesRoutes = new Elysia({ prefix: "/roles" })
  .use(adminProxy)
  .get("/", async ({ set }) => {
    try {
      const roles = await rolesController.getAll();
      return { success: true, roles };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_VIEW) })
  .get("/:id", async ({ params }) => {
    try {
      const role = await rolesController.getById(params.id);
      return { success: true, role };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_VIEW) })
  .post("/", async ({ body }) => {
    try {
      const role = await rolesController.create(body as any);
      return { success: true, role };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_CREATE) })
  .patch("/:id", async ({ params, body }) => {
    try {
      const role = await rolesController.update(params.id, body as any);
      return { success: true, role };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_UPDATE) })
  .delete("/:id", async ({ params }) => {
    try {
      await rolesController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_DELETE) });
