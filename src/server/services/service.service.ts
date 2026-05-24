import { serviceRepository } from "@/server/repositories/service.repository";

export const serviceService = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const { data, total } = await serviceRepository.getAll(options);

    return {
      services: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const row = await serviceRepository.getById(id);
    if (!row) throw new Error("Không tìm thấy dịch vụ");
    return row;
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
    images?: string[];
    features?: string[];
    processSteps?: any;
    pricingOptions?: any;
    faqs?: any;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isFeatured?: boolean;
    isActive?: boolean;
    status?: string;
  }) {
    const existing = await serviceRepository.getBySlug(data.slug);
    if (existing) throw new Error("Slug đã tồn tại");

    return serviceRepository.create({
      ...data,
      status: data.status || "draft",
    });
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;

    if (updateData.slug) {
      const existing = await serviceRepository.getBySlug(updateData.slug);
      if (existing && existing.id !== id) {
        throw new Error("Slug đã tồn tại");
      }
    }

    const updated = await serviceRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updated) throw new Error("Không tìm thấy dịch vụ");
    return updated;
  },

  async delete(id: string) {
    const deleted = await serviceRepository.delete(id);
    if (!deleted) throw new Error("Không tìm thấy dịch vụ");
    return deleted;
  },

  async getPublished() {
    return serviceRepository.getPublished();
  },

  async getPublishedBySlug(slug: string) {
    const service = await serviceRepository.getPublishedBySlug(slug);
    if (!service) throw new Error("Không tìm thấy dịch vụ");
    return service;
  },
};
