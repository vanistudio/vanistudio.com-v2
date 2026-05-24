import { Elysia } from "elysia";
import { serviceService } from "@/server/services/service.service";

export const servicesPublicRoutes = new Elysia({ prefix: "/services" })
  .get("/", async () => {
    try {
      const services = await serviceService.getPublished();
      return { success: true, services };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const service = await serviceService.getPublishedBySlug(params.slug);
      return { success: true, service };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
