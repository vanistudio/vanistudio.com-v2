import { productRepository } from "@/server/repositories/product.repository";

export const productService = {
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
    const { data, total } = await productRepository.getAll(options);

    return {
      products: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const product = await productRepository.getById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    return product;
  },

  async create(data: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    content?: string;
    thumbnail?: string;
    coverImage?: string;
    images?: string[];
    videoUrl?: string;
    demoUrl?: string;
    documentationUrl?: string;
    changelogUrl?: string;
    categoryId?: string;
    type?: string;
    status?: string;
    price?: number;
    salePrice?: number;
    currency?: string;
    techStack?: string[];
    tags?: string[];
    frameworks?: string[];
    version?: string;
    compatibility?: string;
    requirements?: string;
    fileSize?: string;
    features?: string[];
    highlights?: string[];
    warrantyMonths?: number;
    supportEmail?: string;
    supportIncluded?: boolean;
    isFeatured?: boolean;
  }) {
    const existing = await productRepository.getBySlug(data.slug);
    if (existing) throw new Error("Slug đã tồn tại");

    return productRepository.create({
      ...data,
      status: data.status || "draft",
    });
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;

    if (updateData.slug) {
      const existing = await productRepository.getBySlug(updateData.slug);
      if (existing && existing.id !== id) {
        throw new Error("Slug đã tồn tại");
      }
    }

    const updated = await productRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updated) throw new Error("Không tìm thấy sản phẩm");
    return updated;
  },

  async delete(id: string) {
    const deleted = await productRepository.delete(id);
    if (!deleted) throw new Error("Không tìm thấy sản phẩm");
    return deleted;
  },

  async getPublished(options: { limit: number; categoryId?: string }) {
    return productRepository.getPublished(options);
  },

  async getBySlugAndStatus(slug: string, status: "draft" | "published" | "archived" | "discontinued") {
    const product = await productRepository.getBySlugAndStatus(slug, status);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    return product;
  },

  async incrementViewCount(id: string) {
    return productRepository.incrementViewCount(id);
  },
};
