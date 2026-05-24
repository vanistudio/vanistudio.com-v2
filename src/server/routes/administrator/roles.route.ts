import { Elysia } from "elysia";
import { roleService } from "@/server/services/role.service";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const rolesRoutes = new Elysia({ prefix: "/roles" })
  .use(adminProxy)
  .get("/", async () => {
    try {
      const roles = await roleService.getAll();
      return { success: true, roles };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_VIEW) })
  .get("/:id", async ({ params }) => {
    try {
      const role = await roleService.getById(params.id);
      return { success: true, role };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_VIEW) })
  .post("/", async ({ body }) => {
    try {
      const role = await roleService.create(body as any);
      return { success: true, role };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_CREATE) })
  .patch("/:id", async ({ params, body }) => {
    try {
      const role = await roleService.update(params.id, body as any);
      return { success: true, role };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_UPDATE) })
  .delete("/:id", async ({ params }) => {
    try {
      await roleService.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.ROLES_DELETE) });
