import { db } from "@/configs/index.config";
import { categories } from "@/schemas/category.schema";
import { eq, desc, asc } from "drizzle-orm";

export const categoriesController = {
  async getAll() {
    return db.select().from(categories).orderBy(asc(categories.sortOrder), desc(categories.createdAt));
  },

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    coverImage?: string;
    sortOrder?: number;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, data.slug)).limit(1);
    if (existing) throw new Error("Slug đã tồn tại");

    const [category] = await db.insert(categories).values({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      icon: data.icon || null,
      coverImage: data.coverImage || null,
      sortOrder: data.sortOrder ?? 0,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
    }).returning();

    return category;
  },

  async update(id: string, data: Partial<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    coverImage: string;
    sortOrder: number;
    isActive: boolean;
    metaTitle: string;
    metaDescription: string;
  }>) {
    const [updated] = await db.update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) throw new Error("Không tìm thấy chuyên mục");
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (!deleted) throw new Error("Không tìm thấy chuyên mục");
    return deleted;
  },
};
