import { Elysia } from "elysia";
import { blogService } from "@/server/services/blog.service";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const blogRoutes = new Elysia({ prefix: "/blog" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await blogService.getAll({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        search: query.search || undefined,
        status: query.status || undefined,
        category: query.category || undefined,
      });
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.BLOG_VIEW) })
  .get("/:id", async ({ params }) => {
    try {
      const post = await blogService.getById(params.id);
      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.BLOG_VIEW) })
  .post("/", async ({ admin, body }) => {
    try {
      const post = await blogService.create(admin!.userId, body as any);
      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.BLOG_CREATE) })
  .patch("/:id", async ({ params, body }) => {
    try {
      const post = await blogService.update(params.id, body as any);
      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.BLOG_UPDATE) })
  .delete("/:id", async ({ params }) => {
    try {
      await blogService.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.BLOG_DELETE) });
