import { categoryRepository } from "@/server/repositories/category.repository";

export const categoryService = {
  async getAll() {
    return categoryRepository.getAll();
  },

  async create(data: { name: string; slug: string; description?: string; icon?: string; isActive?: boolean }) {
    const existing = await categoryRepository.getBySlug(data.slug);
    if (existing) throw new Error("Slug đã tồn tại");

    const sortOrder = await categoryRepository.getNextSortOrder();

    return categoryRepository.create({
      ...data,
      sortOrder,
    });
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;

    if (updateData.slug) {
      const existing = await categoryRepository.getBySlug(updateData.slug);
      if (existing && existing.id !== id) {
        throw new Error("Slug đã tồn tại");
      }
    }

    const updated = await categoryRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updated) throw new Error("Không tìm thấy danh mục");
    return updated;
  },

  async delete(id: string) {
    const deleted = await categoryRepository.delete(id);
    if (!deleted) throw new Error("Không tìm thấy danh mục");
    return deleted;
  },

  async reorder(items: { id: string; sortOrder: number }[]) {
    const updatedAt = new Date();
    for (const item of items) {
      await categoryRepository.updateSortOrder(item.id, item.sortOrder, updatedAt);
    }
    return { success: true };
  },

  async getActiveCategories() {
    return categoryRepository.getActiveCategories();
  },
};
