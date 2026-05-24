import { db } from "@/server/configs/index.config";
import { blogPosts } from "@/schemas/blog.schema";
import { eq, and, or, like, ilike, desc, asc, sql } from "drizzle-orm";

export const blogRepository = {
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
    if (options.status) {
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

    return { data, total };
  },

  async getById(id: string) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return post || null;
  },

  async getBySlug(slug: string) {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return post || null;
  },

  async getBySlugAndStatus(slug: string, status: "draft" | "published" | "archived") {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, status)))
      .limit(1);
    return post || null;
  },

  async getPublished(options: {
    limit: number;
    category?: string;
    search?: string;
  }) {
    const conditions: any[] = [eq(blogPosts.status, "published")];

    if (options.category) {
      conditions.push(eq(blogPosts.category, options.category));
    }

    if (options.search) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${options.search}%`),
          ilike(blogPosts.excerpt, `%${options.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    return db.select({
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
      .limit(options.limit);
  },

  async create(data: any) {
    const [post] = await db.insert(blogPosts).values(data).returning();
    return post;
  },

  async update(id: string, data: any) {
    const [post] = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
    return post || null;
  },

  async delete(id: string) {
    const [post] = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return post || null;
  },

  async incrementViewCount(id: string) {
    return db.update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, id));
  },

  async getPublishedSlugs() {
    return db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.status, "published"));
  },
};
