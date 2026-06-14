import { galleryRepository } from "@/server/repositories/gallery.repository";
import { type GalleryItem, type NewGalleryItem } from "@/server/db/schemas/gallery.schema";
import { StorageService } from "@/server/io/_others/storage.io";

export class GalleryService {
  async getItems(): Promise<GalleryItem[]> {
    return await galleryRepository.getItems();
  }

  async addItem(data: NewGalleryItem): Promise<GalleryItem> {
    if (!data.url) throw new Error("Đường dẫn file không được trống");
    if (!data.fileName) throw new Error("Tên file không được trống");
    return await galleryRepository.addItem(data);
  }

  async deleteItem(id: string): Promise<void> {
    const item = await galleryRepository.getItemById(id);
    if (item) {
      try {
        await StorageService.deletePhysical(item.url, item.storageType);
      } catch (err) {
        console.error("[GalleryService] Failed to physically delete file:", err);
      }
    }
    await galleryRepository.deleteItem(id);
  }
}

export const galleryService = new GalleryService();
