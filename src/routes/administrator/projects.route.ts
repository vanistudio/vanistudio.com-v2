import { Elysia } from "elysia";
import { projectsController } from "@/controllers/administrator/projects.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const projectsRoutes = new Elysia({ prefix: "/projects" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await projectsController.getAll({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        search: query.search || undefined,
        status: query.status || undefined,
        type: query.type || undefined,
        category: query.category || undefined,
      });
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PROJECTS_VIEW) })
  .get("/:id", async ({ params }) => {
    try {
      const project = await projectsController.getById(params.id);
      return { success: true, project };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PROJECTS_VIEW) })
  .post("/", async ({ admin, body }) => {
    try {
      const project = await projectsController.create(admin!.userId, body as any);
      return { success: true, project };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PROJECTS_CREATE) })
  .patch("/:id", async ({ params, body }) => {
    try {
      const project = await projectsController.update(params.id, body as any);
      return { success: true, project };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PROJECTS_UPDATE) })
  .delete("/:id", async ({ params }) => {
    try {
      await projectsController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PROJECTS_DELETE) });
