import { db } from "@/server/db";
import { blogs, type Blog, type NewBlog } from "@/server/db/schemas/blog.schema";
import { users } from "@/server/db/schemas/user.schema";
import { DEFAULT_BLOGS } from "@/defaults/blog.default";
import { eq, desc, asc, or, and, like, sql, count } from "drizzle-orm";

export interface GetBlogsParams {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  isActive?: boolean;
}

export class BlogRepository {
  async getBlogs(): Promise<Blog[]> {
    return await db.select().from(blogs).orderBy(desc(blogs.createdAt));
  }

  async getBlogsList(params: GetBlogsParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause: any = undefined;
    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      whereClause = or(
        like(blogs.title, searchPattern),
        like(blogs.slug, searchPattern),
        like(blogs.description, searchPattern)
      );
    }

    if (params.isActive !== undefined) {
      whereClause = whereClause
        ? and(whereClause, eq(blogs.isActive, params.isActive))
        : eq(blogs.isActive, params.isActive);
    }

    const sortField = params.sortField || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    let orderBySpec;
    if (sortField === "title") {
      orderBySpec = sortOrder === "desc" ? desc(blogs.title) : asc(blogs.title);
    } else if (sortField === "views") {
      orderBySpec = sortOrder === "desc" ? desc(blogs.views) : asc(blogs.views);
    } else if (sortField === "likes") {
      orderBySpec = sortOrder === "desc" ? desc(blogs.likes) : asc(blogs.likes);
    } else {
      orderBySpec = sortOrder === "desc" ? desc(blogs.createdAt) : asc(blogs.createdAt);
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(blogs)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const rawItems = await db
      .select({
        id: blogs.id,
        title: blogs.title,
        slug: blogs.slug,
        description: blogs.description,
        thumbnail: blogs.thumbnail,
        isActive: blogs.isActive,
        isFeatured: blogs.isFeatured,
        views: blogs.views,
        likes: blogs.likes,
        readingTime: blogs.readingTime,
        publishedAt: blogs.publishedAt,
        createdAt: blogs.createdAt,
        updatedAt: blogs.updatedAt,
        author: {
          name: users.name,
        },
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(whereClause)
      .orderBy(orderBySpec)
      .limit(limit)
      .offset(offset);

    const items = rawItems.map(item => ({
      ...item,
      content: "",
      author: item.author,
    }));

    const [statsResult] = await db
      .select({
        totalBlogs: sql<number>`count(*)`,
        activeBlogs: sql<number>`count(case when is_active = true then 1 end)`,
        featuredBlogs: sql<number>`count(case when is_featured = true then 1 end)`,
      })
      .from(blogs);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        totalBlogs: Number(statsResult?.totalBlogs || 0),
        activeBlogs: Number(statsResult?.activeBlogs || 0),
        featuredBlogs: Number(statsResult?.featuredBlogs || 0),
      },
    };
  }

  async getBlogById(id: string): Promise<Blog | null> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
    return blog || null;
  }

  async getBlogBySlug(slug: string): Promise<(Blog & { author?: { name: string | null } | null }) | null> {
    const results = await db
      .select({
        blog: blogs,
        author: {
          name: users.name,
        },
      })
      .from(blogs)
      .leftJoin(users, eq(blogs.authorId, users.id))
      .where(eq(blogs.slug, slug))
      .limit(1);

    if (results.length === 0) return null;
    const { blog, author } = results[0];
    return {
      ...blog,
      author,
    };
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
        isFeatured: m.isFeatured,
        views: m.views,
        likes: m.likes,
        readingTime: m.readingTime,
        tags: m.tags,
        authorId: m.authorId,
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
