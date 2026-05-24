import { Elysia } from "elysia";
import { blogService } from "@/server/services/blog.service";

export const blogPublicRoutes = new Elysia({ prefix: "/blog" })
  .get("/", async ({ query }) => {
    try {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const data = await blogService.getPublished({
        limit,
        category: query.category || undefined,
        search: query.search || undefined,
      });

      return { success: true, posts: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const post = await blogService.getBySlugAndStatus(params.slug, "published");

      await blogService.incrementViewCount(post.id);

      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
