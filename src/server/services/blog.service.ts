import { blogRepository } from "@/server/repositories/blog.repository";

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const blogService = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const { data, total } = await blogRepository.getAll(options);

    return {
      posts: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const post = await blogRepository.getById(id);
    if (!post) throw new Error("Không tìm thấy bài viết");
    return post;
  },

  async create(authorId: string, data: {
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    thumbnail?: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogImage?: string;
    isFeatured?: boolean;
    authorName?: string;
    authorAvatar?: string;
  }) {
    const existing = await blogRepository.getBySlug(data.slug);
    if (existing) throw new Error("Slug đã tồn tại");

    const readingTime = data.content ? estimateReadingTime(data.content) : 0;
    const publishedAt = data.status === "published" ? new Date() : null;

    return blogRepository.create({
      ...data,
      authorId,
      status: (data.status as any) || "draft",
      readingTime,
      publishedAt,
    });
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, ...updateData } = data;

    if (updateData.content) {
      updateData.readingTime = estimateReadingTime(updateData.content);
    }

    if (updateData.status === "published") {
      const current = await blogRepository.getById(id);
      if (!current?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await blogRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updated) throw new Error("Không tìm thấy bài viết");
    return updated;
  },

  async delete(id: string) {
    const deleted = await blogRepository.delete(id);
    if (!deleted) throw new Error("Không tìm thấy bài viết");
    return deleted;
  },

  async getPublished(options: { limit: number; category?: string; search?: string }) {
    return blogRepository.getPublished(options);
  },

  async getBySlugAndStatus(slug: string, status: "draft" | "published" | "archived") {
    const post = await blogRepository.getBySlugAndStatus(slug, status);
    if (!post) throw new Error("Không tìm thấy bài viết");
    return post;
  },

  async incrementViewCount(id: string) {
    return blogRepository.incrementViewCount(id);
  },
};
