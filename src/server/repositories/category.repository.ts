import { db } from "@/server/configs/index.config";
import { categories } from "@/schemas/category.schema";
import { eq, desc, asc, sql } from "drizzle-orm";

export const categoryRepository = {
  async getAll() {
    return db.select().from(categories).orderBy(asc(categories.sortOrder), desc(categories.createdAt));
  },

  async getById(id: string) {
    const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return row || null;
  },

  async getBySlug(slug: string) {
    const [row] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
    return row || null;
  },

  async getNextSortOrder() {
    const [result] = await db
      .select({ max: sql<number>`coalesce(max(${categories.sortOrder}), -1) + 1` })
      .from(categories);
    return result?.max ?? 0;
  },

  async create(data: any) {
    const [row] = await db.insert(categories).values(data).returning();
    return row;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(categories).where(eq(categories.id, id)).returning();
    return row || null;
  },

  async updateSortOrder(id: string, sortOrder: number, updatedAt: Date) {
    return db.update(categories)
      .set({ sortOrder, updatedAt })
      .where(eq(categories.id, id));
  },

  async getActiveCategories() {
    return db.select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      icon: categories.icon,
    })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));
  },
};
