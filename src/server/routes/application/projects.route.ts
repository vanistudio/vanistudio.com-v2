import { Elysia } from "elysia";
import { projectService } from "@/server/services/project.service";

export const projectsPublicRoutes = new Elysia({ prefix: "/projects" })
  .get("/", async ({ query }) => {
    try {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const data = await projectService.getPublished({
        limit,
        type: query.type || undefined,
        category: query.category || undefined,
      });

      return { success: true, projects: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const project = await projectService.getBySlugAndStatus(params.slug, "published");
      return { success: true, project };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
