import { Elysia } from "elysia";
import { licensesController } from "@/controllers/administrator/licenses.controller";
import { adminProxy } from "@/proxies/administrator.proxy";

export const licensesRoutes = new Elysia({ prefix: "/licenses" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await licensesController.getAll({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        search: query.search || undefined,
        status: query.status || undefined,
      });
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/products", async () => {
    try {
      const products = await licensesController.getProducts();
      return { success: true, products };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/users", async () => {
    try {
      const users = await licensesController.getUsers();
      return { success: true, users };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:id", async ({ params }) => {
    try {
      const license = await licensesController.getById(params.id);
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/", async ({ body }) => {
    try {
      const license = await licensesController.create(body as any);
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .patch("/:id", async ({ params, body }) => {
    try {
      const license = await licensesController.update(params.id, body as any);
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .patch("/:id/revoke", async ({ params }) => {
    try {
      const license = await licensesController.revoke(params.id);
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .delete("/:id", async ({ params }) => {
    try {
      await licensesController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
