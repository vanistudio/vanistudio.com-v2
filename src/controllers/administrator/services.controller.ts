import { db } from "@/configs/index.config";
import { services } from "@/schemas/service.schema";
import { eq, desc, asc, like, or, and, sql } from "drizzle-orm";

export const servicesController = {
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

    if (options.status && ["draft", "published", "archived"].includes(options.status)) {
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

    return {
      services: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (!service) throw new Error("Không tìm thấy dịch vụ");
    return service;
  },

  async create(data: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    content?: string;
    icon?: string;
    thumbnail?: string;
    coverImage?: string;
    price?: string;
    minPrice?: string;
    maxPrice?: string;
    currency?: string;
    priceUnit?: string;
    status?: string;
    categoryId?: string;
    features?: string[];
    deliverables?: string[];
    estimatedDays?: number;
    isFeatured?: boolean;
    sortOrder?: number;
  }) {
    const [existing] = await db.select({ id: services.id }).from(services).where(eq(services.slug, data.slug)).limit(1);
    if (existing) throw new Error("Slug đã tồn tại");

    const [service] = await db.insert(services).values({
      ...data,
      status: (data.status as any) || "draft",
      price: data.price || "0",
      currency: data.currency || "VND",
    }).returning();

    return service;
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;
    const [updated] = await db.update(services)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();

    if (!updated) throw new Error("Không tìm thấy dịch vụ");
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(services).where(eq(services.id, id)).returning();
    if (!deleted) throw new Error("Không tìm thấy dịch vụ");
    return deleted;
  },

  async getPublished() {
    return db.select().from(services)
      .where(and(eq(services.status, "published"), eq(services.isActive, true)))
      .orderBy(asc(services.sortOrder), desc(services.createdAt));
  },

  async getBySlug(slug: string) {
    const [service] = await db.select().from(services)
      .where(and(eq(services.slug, slug), eq(services.status, "published")))
      .limit(1);
    if (!service) throw new Error("Không tìm thấy dịch vụ");
    return service;
  },
};
