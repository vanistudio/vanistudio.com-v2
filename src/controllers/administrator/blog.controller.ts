import { db } from "@/configs/index.config";
import { blogPosts } from "@/schemas/blog.schema";
import { eq, desc, asc, like, or, and, sql } from "drizzle-orm";

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const blogController = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = db.select().from(blogPosts).$dynamic();
    const conditions = [];

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(or(like(blogPosts.title, search), like(blogPosts.excerpt, search)));
    }
    if (options.status && ["draft", "published", "archived"].includes(options.status)) {
      conditions.push(eq(blogPosts.status, options.status as any));
    }
    if (options.category) {
      conditions.push(eq(blogPosts.category, options.category));
    }

    const whereClause = conditions.length > 1
      ? and(...conditions.filter(Boolean) as any)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

    if (whereClause) query = query.where(whereClause);
    query = query.orderBy(asc(blogPosts.sortOrder), desc(blogPosts.createdAt));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(blogPosts)
      .where(whereClause);

    const total = Number(countResult?.count || 0);
    const data = await query.limit(limit).offset(offset);

    return {
      posts: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    if (!post) throw new Error("Không tìm thấy bài viết");
    return post;
  },

  async create(authorId: string, data: {
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    isFeatured?: boolean;
    authorName?: string;
    authorAvatar?: string;
  }) {
    const [existing] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, data.slug)).limit(1);
    if (existing) throw new Error("Slug đã tồn tại");

    const readingTime = data.content ? estimateReadingTime(data.content) : 0;
    const publishedAt = data.status === "published" ? new Date() : null;

    const [post] = await db.insert(blogPosts).values({
      ...data,
      authorId,
      status: (data.status as any) || "draft",
      readingTime,
      publishedAt,
    }).returning();

    return post;
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;

    if (updateData.content) {
      updateData.readingTime = estimateReadingTime(updateData.content);
    }

    // Auto-set publishedAt when publishing for the first time
    if (updateData.status === "published") {
      const [current] = await db.select({ publishedAt: blogPosts.publishedAt }).from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      if (!current?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await db.update(blogPosts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();

    if (!updated) throw new Error("Không tìm thấy bài viết");
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    if (!deleted) throw new Error("Không tìm thấy bài viết");
    return deleted;
  },
};
