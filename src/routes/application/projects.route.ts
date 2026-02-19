import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { projects } from "@/schemas/project.schema";
import { eq, desc, asc, and } from "drizzle-orm";

export const projectsPublicRoutes = new Elysia({ prefix: "/projects" })
  .get("/", async ({ query }) => {
    try {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const conditions: any[] = [eq(projects.status, "published")];

      if (query.type && ["personal", "freelance", "open-source", "collaboration"].includes(query.type)) {
        conditions.push(eq(projects.type, query.type as any));
      }
      if (query.category) {
        conditions.push(eq(projects.category, query.category));
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

      const data = await db.select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        tagline: projects.tagline,
        description: projects.description,
        thumbnail: projects.thumbnail,
        coverImage: projects.coverImage,
        category: projects.category,
        techStack: projects.techStack,
        tags: projects.tags,
        type: projects.type,
        liveUrl: projects.liveUrl,
        isFeatured: projects.isFeatured,
        isOngoing: projects.isOngoing,
        startDate: projects.startDate,
        endDate: projects.endDate,
      })
        .from(projects)
        .where(whereClause)
        .orderBy(asc(projects.sortOrder), desc(projects.createdAt))
        .limit(limit);

      return { success: true, projects: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const [project] = await db.select({
        id: projects.id,
        name: projects.name,
        slug: projects.slug,
        tagline: projects.tagline,
        description: projects.description,
        content: projects.content,
        thumbnail: projects.thumbnail,
        coverImage: projects.coverImage,
        images: projects.images,
        videoUrl: projects.videoUrl,
        liveUrl: projects.liveUrl,
        sourceUrl: projects.sourceUrl,
        figmaUrl: projects.figmaUrl,
        category: projects.category,
        techStack: projects.techStack,
        tags: projects.tags,
        type: projects.type,
        startDate: projects.startDate,
        endDate: projects.endDate,
        isOngoing: projects.isOngoing,
        clientName: projects.clientName,
        role: projects.role,
        isFeatured: projects.isFeatured,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      }).from(projects)
        .where(and(eq(projects.slug, params.slug), eq(projects.status, "published")))
        .limit(1);

      if (!project) return { success: false, error: "Không tìm thấy dự án" };

      return { success: true, project };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
