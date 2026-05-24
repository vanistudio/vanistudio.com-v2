import { db } from "@/server/configs/index.config";
import { products } from "@/schemas/product.schema";
import { eq, desc, asc, and, or, like, sql } from "drizzle-orm";

export const productRepository = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    type?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = db.select().from(products).$dynamic();
    const conditions = [];

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(or(like(products.name, search), like(products.tagline, search)));
    }

    if (options.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }

    if (options.status) {
      conditions.push(eq(products.status, options.status as any));
    }

    if (options.type) {
      conditions.push(eq(products.type, options.type as any));
    }

    const whereClause = conditions.length > 1
      ? and(...conditions.filter(Boolean) as any)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

    if (whereClause) query = query.where(whereClause);
    query = query.orderBy(asc(products.sortOrder), desc(products.createdAt));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause);

    const total = Number(countResult?.count || 0);
    const data = await query.limit(limit).offset(offset);

    return { data, total };
  },

  async getById(id: string) {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product || null;
  },

  async getBySlug(slug: string) {
    const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    return product || null;
  },

  async getBySlugAndStatus(slug: string, status: "draft" | "published" | "archived" | "discontinued") {
    const [product] = await db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      tagline: products.tagline,
      description: products.description,
      content: products.content,
      thumbnail: products.thumbnail,
      coverImage: products.coverImage,
      images: products.images,
      videoUrl: products.videoUrl,
      demoUrl: products.demoUrl,
      documentationUrl: products.documentationUrl,
      changelogUrl: products.changelogUrl,
      type: products.type,
      status: products.status,
      price: products.price,
      salePrice: products.salePrice,
      currency: products.currency,
      techStack: products.techStack,
      tags: products.tags,
      frameworks: products.frameworks,
      version: products.version,
      compatibility: products.compatibility,
      requirements: products.requirements,
      fileSize: products.fileSize,
      viewCount: products.viewCount,
      downloadCount: products.downloadCount,
      purchaseCount: products.purchaseCount,
      rating: products.rating,
      ratingCount: products.ratingCount,
      features: products.features,
      highlights: products.highlights,
      warrantyMonths: products.warrantyMonths,
      supportEmail: products.supportEmail,
      supportIncluded: products.supportIncluded,
      isFeatured: products.isFeatured,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    }).from(products)
      .where(and(eq(products.slug, slug), eq(products.status, status)))
      .limit(1);
    return product || null;
  },

  async getPublished(options: {
    limit: number;
    categoryId?: string;
  }) {
    const conditions: any[] = [eq(products.status, "published")];

    if (options.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    return db.select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      tagline: products.tagline,
      description: products.description,
      thumbnail: products.thumbnail,
      coverImage: products.coverImage,
      type: products.type,
      status: products.status,
      price: products.price,
      salePrice: products.salePrice,
      currency: products.currency,
      techStack: products.techStack,
      tags: products.tags,
      isFeatured: products.isFeatured,
      version: products.version,
    })
      .from(products)
      .where(whereClause)
      .orderBy(asc(products.sortOrder), desc(products.createdAt))
      .limit(options.limit);
  },

  async create(data: any) {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(products).where(eq(products.id, id)).returning();
    return row || null;
  },

  async incrementViewCount(id: string) {
    return db.update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.id, id));
  },
};
