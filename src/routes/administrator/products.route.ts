import { Elysia, t } from "elysia";
import { productsController } from "@/controllers/administrator/products.controller";
import { adminProxy } from "@/proxies/administrator.proxy";

export const productsRoutes = new Elysia({ prefix: "/products" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await productsController.getAll({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        search: query.search || undefined,
        categoryId: query.categoryId || undefined,
        status: query.status || undefined,
        type: query.type || undefined,
      });
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:id", async ({ params }) => {
    try {
      const product = await productsController.getById(params.id);
      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/", async ({ admin, body }) => {
    try {
      const product = await productsController.create(admin!.userId, body as any);
      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .patch("/:id", async ({ params, body }) => {
    try {
      const product = await productsController.update(params.id, body as any);
      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .delete("/:id", async ({ params }) => {
    try {
      await productsController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
