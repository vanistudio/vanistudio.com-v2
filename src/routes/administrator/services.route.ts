import { Elysia } from "elysia";
import { servicesController } from "@/controllers/administrator/services.controller";
import { adminProxy } from "@/proxies/administrator.proxy";

export const servicesRoutes = new Elysia({ prefix: "/services" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await servicesController.getAll({
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
  .get("/:id", async ({ params }) => {
    try {
      const service = await servicesController.getById(params.id);
      return { success: true, service };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/", async ({ body }) => {
    try {
      const service = await servicesController.create(body as any);
      return { success: true, service };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .patch("/:id", async ({ params, body }) => {
    try {
      const service = await servicesController.update(params.id, body as any);
      return { success: true, service };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .delete("/:id", async ({ params }) => {
    try {
      await servicesController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
