import { settingRepository } from "@/server/repositories/setting.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { roleRepository } from "@/server/repositories/role.repository";
import { invalidateSettingsCache } from "./setting.service";

export const configurationService = {
  async getStatus() {
    const setting = await settingRepository.get();
    const adminCount = await userRepository.countAdminUsers();

    const settingsExist = !!setting;
    const adminExist = adminCount > 0;

    return {
      needsSetup: !settingsExist || !adminExist,
      hasSettings: settingsExist,
      hasAdmin: adminExist,
    };
  },

  async setupSite(
    userId: string,
    data: {
      siteName: string;
      siteUrl: string;
      siteTagline?: string;
      siteDescription?: string;
      siteLanguage?: string;
      siteMetaTitle?: string;
      siteMetaDescription?: string;
      siteMetaKeywords?: string;
      siteMetaAuthor?: string;
    }
  ) {
    const existingSetting = await settingRepository.get();
    if (existingSetting) throw new Error("Website đã được cài đặt");

    const setting = await settingRepository.create({
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      siteTagline: data.siteTagline || null,
      siteDescription: data.siteDescription || null,
      siteLanguage: data.siteLanguage || "vi",
      siteMetaTitle: data.siteMetaTitle || data.siteName,
      siteMetaDescription: data.siteMetaDescription || data.siteDescription || null,
      siteMetaKeywords: data.siteMetaKeywords || null,
      siteMetaAuthor: data.siteMetaAuthor || null,
    });

    // Lookup admin role
    const adminRole = await roleRepository.getByName("admin");

    const admin = await userRepository.update(userId, {
      role: "admin",
      roleId: adminRole?.id || null,
      updatedAt: new Date(),
    });

    invalidateSettingsCache();

    return { setting, admin };
  },
};
