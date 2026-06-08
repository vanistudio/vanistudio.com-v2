import { db } from "@/server/db";
import { settings, type Setting } from "@/server/db/schemas/setting.schema";
import { eq } from "drizzle-orm";

export class SettingsRepository {
  async getSettings(): Promise<Setting | null> {
    const [result] = await db.select().from(settings).limit(1);
    return result || null;
  }

  async updateSettings(id: string, data: Partial<Omit<Setting, "id" | "createdAt" | "updatedAt">>): Promise<Setting> {
    const [updated] = await db
      .update(settings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(settings.id, id))
      .returning();
    if (!updated) throw new Error("Không tìm thấy cấu hình để cập nhật");
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
