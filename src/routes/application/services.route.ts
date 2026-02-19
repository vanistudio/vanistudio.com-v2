import { Elysia } from "elysia";
import { servicesController } from "@/controllers/administrator/services.controller";

export const servicesPublicRoutes = new Elysia({ prefix: "/services" })
  .get("/", async () => {
    try {
      const services = await servicesController.getPublished();
      return { success: true, services };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const service = await servicesController.getBySlug(params.slug);
      return { success: true, service };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
