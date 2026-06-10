import { db } from "@/server/db";
import { cmsPages, type CmsPage, type NewCmsPage } from "@/server/db/schemas/cms-page.schema";
import { eq, desc } from "drizzle-orm";

export class CmsRepository {
  async getPages(): Promise<CmsPage[]> {
    return await db.select().from(cmsPages).orderBy(desc(cmsPages.createdAt));
  }

  async getPageById(id: string): Promise<CmsPage | null> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id)).limit(1);
    return page || null;
  }

  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug)).limit(1);
    return page || null;
  }

  async createPage(data: NewCmsPage): Promise<CmsPage> {
    const [inserted] = await db.insert(cmsPages).values(data).returning();
    if (!inserted) throw new Error("Tạo trang CMS thất bại");
    return inserted;
  }

  async updatePage(id: string, data: Partial<Omit<CmsPage, "id" | "createdAt">>): Promise<CmsPage> {
    const [updated] = await db
      .update(cmsPages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cmsPages.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật trang CMS thất bại hoặc không tìm thấy trang");
    return updated;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(cmsPages).where(eq(cmsPages.id, id));
  }
}

export const cmsRepository = new CmsRepository();
