import { db } from "@/server/db";
import { blogs, type Blog, type NewBlog } from "@/server/db/schemas/blog.schema";
import { DEFAULT_BLOGS } from "@/defaults/blog.default";
import { eq, desc } from "drizzle-orm";

export class BlogRepository {
  async getBlogs(): Promise<Blog[]> {
    return await db.select().from(blogs).orderBy(desc(blogs.createdAt));
  }

  async getBlogById(id: string): Promise<Blog | null> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
    return blog || null;
  }

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.slug, slug)).limit(1);
    return blog || null;
  }

  async seedDefaultBlogs(customBlogs?: Omit<NewBlog, "id" | "createdAt" | "updatedAt">[]): Promise<void> {
    const blogsToSeed = customBlogs || DEFAULT_BLOGS;
    if (blogsToSeed.length > 0) {
      const toInsert = blogsToSeed.map((m) => ({
        title: m.title,
        slug: m.slug,
        description: m.description,
        content: m.content,
        thumbnail: m.thumbnail,
        metaTitle: m.metaTitle,
        metaDescription: m.metaDescription,
        metaKeywords: m.metaKeywords,
        isActive: m.isActive,
        publishedAt: m.publishedAt ? new Date(m.publishedAt) : null,
      }));
      await db.insert(blogs).values(toInsert).onConflictDoNothing();
    }
  }

  async createBlog(data: NewBlog): Promise<Blog> {
    const [inserted] = await db.insert(blogs).values(data).returning();
    if (!inserted) throw new Error("Tạo bài viết Blog thất bại");
    return inserted;
  }

  async updateBlog(id: string, data: Partial<Omit<Blog, "id" | "createdAt">>): Promise<Blog> {
    const [updated] = await db
      .update(blogs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(blogs.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật bài viết Blog thất bại hoặc không tìm thấy bài viết");
    return updated;
  }

  async deleteBlog(id: string): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }
}

export const blogRepository = new BlogRepository();
