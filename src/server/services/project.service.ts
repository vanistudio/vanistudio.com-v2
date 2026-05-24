import { projectRepository } from "@/server/repositories/project.repository";

export const projectService = {
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
    const { data, total } = await projectRepository.getAll(options);

    return {
      projects: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const project = await projectRepository.getById(id);
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
    type?: string;
    startDate?: string;
    endDate?: string;
    isOngoing?: boolean;
    clientName?: string;
    role?: string;
    isFeatured?: boolean;
    status?: string;
  }) {
    const existing = await projectRepository.getBySlug(data.slug);
    if (existing) throw new Error("Slug đã tồn tại");

    return projectRepository.create({
      ...data,
      authorId,
      status: data.status || "draft",
    });
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;

    if (updateData.slug) {
      const existing = await projectRepository.getBySlug(updateData.slug);
      if (existing && existing.id !== id) {
        throw new Error("Slug đã tồn tại");
      }
    }

    const updated = await projectRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updated) throw new Error("Không tìm thấy dự án");
    return updated;
  },

  async delete(id: string) {
    const deleted = await projectRepository.delete(id);
    if (!deleted) throw new Error("Không tìm thấy dự án");
    return deleted;
  },

  async getPublished(options: { limit: number; type?: string; category?: string }) {
    return projectRepository.getPublished(options);
  },

  async getBySlugAndStatus(slug: string, status: "draft" | "published" | "archived") {
    const project = await projectRepository.getBySlugAndStatus(slug, status);
    if (!project) throw new Error("Không tìm thấy dự án");
    return project;
  },
};
