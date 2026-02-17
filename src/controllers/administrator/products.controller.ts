import { db } from "@/configs/index.config";
import { products } from "@/schemas/product.schema";
import { categories } from "@/schemas/category.schema";
import { eq, desc, asc, like, or, sql } from "drizzle-orm";

export const productsController = {
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

    if (options.status && ["draft", "published", "archived"].includes(options.status)) {
      conditions.push(eq(products.status, options.status as any));
    }

    if (options.type && ["free", "premium", "enterprise"].includes(options.type)) {
      conditions.push(eq(products.type, options.type as any));
    }

    for (const c of conditions) {
      if (c) query = query.where(c);
    }

    query = query.orderBy(asc(products.sortOrder), desc(products.createdAt));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions.length > 0 ? conditions[0] : undefined);

    const total = Number(countResult?.count || 0);
    const data = await query.limit(limit).offset(offset);

    return {
      products: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    return product;
  },

  async create(authorId: string, data: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    content?: string;
    categoryId?: string;
    type?: string;
    status?: string;
    thumbnail?: string;
    coverImage?: string;
    images?: string[];
    videoUrl?: string;
    demoUrl?: string;
    sourceUrl?: string;
    documentationUrl?: string;
    changelogUrl?: string;
    techStack?: string[];
    tags?: string[];
    frameworks?: string[];
    price?: string;
    salePrice?: string;
    currency?: string;
    version?: string;
    compatibility?: string;
    requirements?: string;
    fileSize?: string;
    features?: string[];
    highlights?: { icon: string; title: string; description: string }[];
    warrantyMonths?: number;
    supportEmail?: string;
    supportIncluded?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isFeatured?: boolean;
    sortOrder?: number;
  }) {
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, data.slug)).limit(1);
    if (existing) throw new Error("Slug đã tồn tại");

    const [product] = await db.insert(products).values({
      ...data,
      authorId,
      type: (data.type as any) || "premium",
      status: (data.status as any) || "draft",
      price: data.price || "0",
      currency: data.currency || "VND",
    }).returning();

    return product;
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;
    const [updated] = await db.update(products)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    if (!updated) throw new Error("Không tìm thấy sản phẩm");
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
    if (!deleted) throw new Error("Không tìm thấy sản phẩm");
    return deleted;
  },
};
