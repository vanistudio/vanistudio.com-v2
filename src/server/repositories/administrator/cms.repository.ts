import { db } from "@/server/db";
import { cmsPages, type CmsPage, type NewCmsPage } from "@/server/db/schemas/cms-page.schema";
import { DEFAULT_CMS_PAGES } from "@/defaults/cms-page.default";
import { eq, desc } from "drizzle-orm";

export class CmsRepository {
  async getPages(): Promise<CmsPage[]> {
    const dbPages = await db.select().from(cmsPages).orderBy(desc(cmsPages.createdAt));
    const dbSlugs = new Set(dbPages.map((p) => p.slug));

    const missing = DEFAULT_CMS_PAGES.filter((def) => !dbSlugs.has(def.slug));
    if (missing.length > 0) {
      const toInsert = missing.map((m) => ({
        title: m.title,
        slug: m.slug,
        description: m.description,
        content: m.content,
        thumbnail: m.thumbnail,
        metaTitle: m.metaTitle,
        metaDescription: m.metaDescription,
        metaKeywords: m.metaKeywords,
        isActive: m.isActive,
        publishedAt: m.publishedAt,
      }));
      await db.insert(cmsPages).values(toInsert).onConflictDoNothing();
      return await db.select().from(cmsPages).orderBy(desc(cmsPages.createdAt));
    }

    return dbPages;
  }

  async getPageById(id: string): Promise<CmsPage | null> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id)).limit(1);
    return page || null;
  }

  async getPageBySlug(slug: string): Promise<CmsPage | null> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug)).limit(1);
    if (!page) {
      const defaultPage = DEFAULT_CMS_PAGES.find((p) => p.slug === slug);
      if (defaultPage) {
        const [inserted] = await db
          .insert(cmsPages)
          .values({
            title: defaultPage.title,
            slug: defaultPage.slug,
            description: defaultPage.description,
            content: defaultPage.content,
            thumbnail: defaultPage.thumbnail,
            metaTitle: defaultPage.metaTitle,
            metaDescription: defaultPage.metaDescription,
            metaKeywords: defaultPage.metaKeywords,
            isActive: defaultPage.isActive,
            publishedAt: defaultPage.publishedAt,
          })
          .returning();
        return inserted || null;
      }
    }
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
