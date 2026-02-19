import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { blogPosts } from "@/schemas/blog.schema";
import { eq, desc, and, sql, ilike, or } from "drizzle-orm";

export const blogPublicRoutes = new Elysia({ prefix: "/blog" })
  .get("/", async ({ query }) => {
    try {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const conditions: any[] = [eq(blogPosts.status, "published")];

      if (query.category) {
        conditions.push(eq(blogPosts.category, query.category));
      }

      if (query.search) {
        conditions.push(
          or(
            ilike(blogPosts.title, `%${query.search}%`),
            ilike(blogPosts.excerpt, `%${query.search}%`)
          )
        );
      }

      const whereClause = conditions.length > 1
        ? and(...conditions)
        : conditions[0];

      const data = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        thumbnail: blogPosts.thumbnail,
        category: blogPosts.category,
        tags: blogPosts.tags,
        authorName: blogPosts.authorName,
        authorAvatar: blogPosts.authorAvatar,
        viewCount: blogPosts.viewCount,
        readingTime: blogPosts.readingTime,
        isFeatured: blogPosts.isFeatured,
        publishedAt: blogPosts.publishedAt,
        createdAt: blogPosts.createdAt,
      })
        .from(blogPosts)
        .where(whereClause)
        .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
        .limit(limit);

      return { success: true, posts: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const [post] = await db.select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.status, "published")))
        .limit(1);

      if (!post) return { success: false, error: "Không tìm thấy bài viết" };

      await db.update(blogPosts)
        .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
        .where(eq(blogPosts.id, post.id));

      return { success: true, post };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
