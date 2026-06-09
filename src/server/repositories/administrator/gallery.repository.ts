import { db } from "@/server/db";
import { gallery, type GalleryItem, type NewGalleryItem } from "@/server/db/schemas/gallery.schema";
import { eq, desc } from "drizzle-orm";

export class GalleryRepository {
  async getItems(): Promise<GalleryItem[]> {
    return await db.select().from(gallery).orderBy(desc(gallery.createdAt));
  }

  async getItemById(id: string): Promise<GalleryItem | null> {
    const [item] = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
    return item || null;
  }

  async addItem(data: NewGalleryItem): Promise<GalleryItem> {
    const [inserted] = await db.insert(gallery).values(data).returning();
    if (!inserted) throw new Error("Thêm ảnh vào thư viện thất bại");
    return inserted;
  }

  async deleteItem(id: string): Promise<void> {
    await db.delete(gallery).where(eq(gallery.id, id));
  }
}

export const galleryRepository = new GalleryRepository();
