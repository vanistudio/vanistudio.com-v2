import { db } from "@/server/configs/index.config";
import { services } from "@/schemas/service.schema";
import { eq, desc, asc, and, or, like, sql } from "drizzle-orm";

export const serviceRepository = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(or(like(services.name, search), like(services.tagline, search)));
    }

    if (options.status) {
      conditions.push(eq(services.status, options.status as any));
    }

    const whereClause = conditions.length > 1
      ? and(...conditions.filter(Boolean) as any)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(services)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    const data = await db.select().from(services)
      .where(whereClause)
      .orderBy(asc(services.sortOrder), desc(services.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  },

  async getById(id: string) {
    const [row] = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return row || null;
  },

  async getBySlug(slug: string) {
    const [row] = await db.select({ id: services.id }).from(services).where(eq(services.slug, slug)).limit(1);
    return row || null;
  },

  async getPublished() {
    return db.select().from(services)
      .where(and(eq(services.status, "published"), eq(services.isActive, true)))
      .orderBy(asc(services.sortOrder), desc(services.createdAt));
  },

  async getPublishedBySlug(slug: string) {
    const [row] = await db.select().from(services)
      .where(and(eq(services.slug, slug), eq(services.status, "published")))
      .limit(1);
    return row || null;
  },

  async create(data: any) {
    const [row] = await db.insert(services).values(data).returning();
    return row;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(services).set(data).where(eq(services.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(services).where(eq(services.id, id)).returning();
    return row || null;
  },
};
