import { db } from "@/configs/index.config";
import { projects } from "@/schemas/project.schema";
import { eq, desc, asc, like, or, and, sql } from "drizzle-orm";

export const projectsController = {
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
    if (options.status && ["draft", "published", "archived"].includes(options.status)) {
      conditions.push(eq(projects.status, options.status as any));
    }
    if (options.type && ["personal", "freelance", "open-source", "collaboration"].includes(options.type)) {
      conditions.push(eq(projects.type, options.type as any));
    }
    if (options.category) {
      conditions.push(eq(projects.category, options.category));
    }

    for (const c of conditions) {
      if (c) query = query.where(c);
    }

    query = query.orderBy(asc(projects.sortOrder), desc(projects.createdAt));

    const whereClause = conditions.length > 1
      ? and(...conditions.filter(Boolean) as any)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(whereClause);

    const total = Number(countResult?.count || 0);
    const data = await query.limit(limit).offset(offset);

    return {
      projects: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!project) throw new Error("Không tìm thấy dự án");
    return project;
  },

  async create(authorId: string, data: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    content?: string;
    thumbnail?: string;
    coverImage?: string;
    images?: string[];
    videoUrl?: string;
    liveUrl?: string;
    sourceUrl?: string;
    figmaUrl?: string;
    category?: string;
    techStack?: string[];
    tags?: string[];
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    isOngoing?: boolean;
    clientName?: string;
    role?: string;
    isFeatured?: boolean;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const [existing] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, data.slug)).limit(1);
    if (existing) throw new Error("Slug đã tồn tại");

    const [project] = await db.insert(projects).values({
      ...data,
      authorId,
      status: (data.status as any) || "draft",
      type: (data.type as any) || "personal",
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    }).returning();

    return project;
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;

    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const [updated] = await db.update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (!updated) throw new Error("Không tìm thấy dự án");
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(projects).where(eq(projects.id, id)).returning();
    if (!deleted) throw new Error("Không tìm thấy dự án");
    return deleted;
  },
};
