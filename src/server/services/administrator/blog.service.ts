import { blogRepository } from "@/server/repositories/blog.repository";
import { type Blog, type NewBlog } from "@/server/db/schemas/blog.schema";

export class BlogService {
  async getBlogs(): Promise<Blog[]> {
    return await blogRepository.getBlogs();
  }

  async getBlogsList(params: any) {
    const result = await blogRepository.getBlogsList(params);
    return {
      resultCode: 0,
      message: "Success",
      data: {
        items: result.items,
        stats: result.stats,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  async getBlogById(id: string): Promise<Blog | null> {
    return await blogRepository.getBlogById(id);
  }

  async getBlogBySlug(slug: string): Promise<(Blog & { author?: { name: string | null } | null }) | null> {
    return await blogRepository.getBlogBySlug(slug);
  }

  async createBlog(data: Omit<NewBlog, "id" | "createdAt" | "updatedAt">): Promise<Blog> {
    if (!data.title?.trim()) throw new Error("Tiêu đề bài viết không được để trống");
    if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
    if (!data.content?.trim()) throw new Error("Nội dung không được để trống");

    const existing = await blogRepository.getBlogBySlug(data.slug);
    if (existing) {
      throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
    }

    const publishedAt = data.isActive ? new Date() : null;

    return await blogRepository.createBlog({
      ...data,
      publishedAt,
    });
  }

  async updateBlog(id: string, data: Partial<Omit<Blog, "id" | "createdAt" | "updatedAt">>): Promise<Blog> {
    const blog = await blogRepository.getBlogById(id);
    if (!blog) throw new Error("Không tìm thấy bài viết Blog cần cập nhật");

    if (data.title !== undefined && !data.title?.trim()) {
      throw new Error("Tiêu đề bài viết không được để trống");
    }

    if (data.slug !== undefined) {
      if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
      const existing = await blogRepository.getBlogBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
      }
    }

    let publishedAt = blog.publishedAt;
    if (data.isActive !== undefined) {
      if (data.isActive) {
        publishedAt = blog.publishedAt || new Date();
      } else {
        publishedAt = null;
      }
    }

    return await blogRepository.updateBlog(id, {
      ...data,
      publishedAt,
    });
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await blogRepository.getBlogById(id);
    if (!blog) throw new Error("Không tìm thấy bài viết Blog cần xóa");
    await blogRepository.deleteBlog(id);
  }

  async seedBlogs(customBlogs?: Omit<NewBlog, "id" | "createdAt" | "updatedAt">[]): Promise<any> {
    await blogRepository.seedDefaultBlogs(customBlogs);
    return { resultCode: "SUCCESS", message: "Đổ dữ liệu mẫu bài viết Blog thành công" };
  }
}

export const blogService = new BlogService();
