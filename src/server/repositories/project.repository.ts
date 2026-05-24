import { db } from "@/server/configs/index.config";
import { projects } from "@/schemas/project.schema";
import { eq, desc, asc, and, or, like, sql } from "drizzle-orm";

export const projectRepository = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    category?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = db.select().from(projects).$dynamic();
    const conditions = [];

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(or(like(projects.name, search), like(projects.tagline, search)));
    }
    if (options.status) {
      conditions.push(eq(projects.status, options.status as any));
    }
    if (options.type) {
      conditions.push(eq(projects.type, options.type as any));
    }
    if (options.category) {
      conditions.push(eq(projects.category, options.category));
    }

    const whereClause = conditions.length > 1
      ? and(...conditions.filter(Boolean) as any)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

    if (whereClause) query = query.where(whereClause);
    query = query.orderBy(asc(projects.sortOrder), desc(projects.createdAt));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(whereClause);

    const total = Number(countResult?.count || 0);
    const data = await query.limit(limit).offset(offset);

    return { data, total };
  },

  async getById(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return project || null;
  },

  async getBySlug(slug: string) {
    const [row] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug)).limit(1);
    return row || null;
  },

  async getBySlugAndStatus(slug: string, status: "draft" | "published" | "archived") {
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
      .where(and(eq(projects.slug, slug), eq(projects.status, status)))
      .limit(1);
    return project || null;
  },

  async getPublished(options: {
    limit: number;
    type?: string;
    category?: string;
  }) {
    const conditions: any[] = [eq(projects.status, "published")];

    if (options.type) {
      conditions.push(eq(projects.type, options.type as any));
    }
    if (options.category) {
      conditions.push(eq(projects.category, options.category));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    return db.select({
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
      .limit(options.limit);
  },

  async create(data: any) {
    const [project] = await db.insert(projects).values(data).returning();
    return project;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(projects).where(eq(projects.id, id)).returning();
    return row || null;
  },
};
