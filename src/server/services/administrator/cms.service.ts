import { cmsRepository } from "@/server/repositories/administrator/cms.repository";
import { type CmsPage, type NewCmsPage } from "@/server/db/schemas/cms-page.schema";

export class CmsService {
  async getPages(): Promise<CmsPage[]> {
    return await cmsRepository.getPages();
  }

  async getPageById(id: string): Promise<CmsPage | null> {
    return await cmsRepository.getPageById(id);
  }

  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    return await cmsRepository.getPageBySlug(slug);
  }

  async createPage(data: Omit<NewCmsPage, "id" | "createdAt" | "updatedAt">): Promise<CmsPage> {
    if (!data.title?.trim()) throw new Error("Tiêu đề trang không được để trống");
    if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
    if (!data.content?.trim()) throw new Error("Nội dung không được để trống");

    const existing = await cmsRepository.getPageBySlug(data.slug);
    if (existing) {
      throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
    }

    const publishedAt = data.isActive ? new Date() : null;

    return await cmsRepository.createPage({
      ...data,
      publishedAt,
    });
  }

  async updatePage(id: string, data: Partial<Omit<CmsPage, "id" | "createdAt" | "updatedAt">>): Promise<CmsPage> {
    const page = await cmsRepository.getPageById(id);
    if (!page) throw new Error("Không tìm thấy trang CMS cần cập nhật");

    if (data.title !== undefined && !data.title?.trim()) {
      throw new Error("Tiêu đề trang không được để trống");
    }

    if (data.slug !== undefined) {
      if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
      const existing = await cmsRepository.getPageBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
      }
    }

    let publishedAt = page.publishedAt;
    if (data.isActive !== undefined) {
      if (data.isActive) {
        publishedAt = page.publishedAt || new Date();
      } else {
        publishedAt = null;
      }
    }

    return await cmsRepository.updatePage(id, {
      ...data,
      publishedAt,
    });
  }

  async deletePage(id: string): Promise<void> {
    const page = await cmsRepository.getPageById(id);
    if (!page) throw new Error("Không tìm thấy trang CMS cần xóa");
    await cmsRepository.deletePage(id);
  }

  async seedPages(customPages?: Omit<NewCmsPage, "id" | "createdAt" | "updatedAt">[]): Promise<any> {
    await cmsRepository.seedDefaultPages(customPages);
    return { resultCode: "SUCCESS", message: "Đổ dữ liệu mẫu trang CMS thành công" };
  }
}

export const cmsService = new CmsService();
