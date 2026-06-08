import { settingsRepository } from "@/server/repositories/administrator/settings.repository";
import { type Setting } from "@/server/db/schemas/setting.schema";

export class SettingsService {
  async getSettings() {
    const settings = await settingsRepository.getSettings();
    if (!settings) throw new Error("Cấu hình hệ thống chưa được khởi tạo");
    return settings;
  }

  async updateSettings(id: string, data: Partial<Omit<Setting, "id" | "createdAt" | "updatedAt">>) {
    return await settingsRepository.updateSettings(id, data);
  }
}

export const settingsService = new SettingsService();
