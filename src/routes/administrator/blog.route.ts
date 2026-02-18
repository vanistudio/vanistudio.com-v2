import { Elysia } from "elysia";
import { blogController } from "@/controllers/administrator/blog.controller";
import { adminProxy } from "@/proxies/administrator.proxy";

export const blogRoutes = new Elysia({ prefix: "/blog" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await blogController.getAll({
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
  })
  .get("/:id", async ({ params }) => {
    try {
      const post = await blogController.getById(params.id);
      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/", async ({ admin, body }) => {
    try {
      const post = await blogController.create(admin!.userId, body as any);
      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .patch("/:id", async ({ params, body }) => {
    try {
      const post = await blogController.update(params.id, body as any);
      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .delete("/:id", async ({ params }) => {
    try {
      await blogController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
