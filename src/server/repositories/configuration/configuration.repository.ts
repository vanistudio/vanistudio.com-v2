import { db } from "@/server/db";
import { settings } from "@/server/db/schemas/setting.schema";
import { users, provider } from "@/server/db/schemas/user.schema";
import { extensions } from "@/server/db/schemas/extension.schema";
import { DEFAULT_EXTENSIONS } from "@/defaults/extension.default";
import { eq, sql } from "drizzle-orm";
import { uuidv7 } from "@/lib/utils";

export class ConfigurationRepository {
  async checkConfigurationStatus(): Promise<boolean> {
    try {
      const settingRecord = await db.select().from(settings).limit(1);
      const adminRecord = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
      return settingRecord.length > 0 && adminRecord.length > 0;
    } catch {
      return false;
    }
  }

  async checkDbStatus(): Promise<{ connectionOk: boolean; tablesExist: boolean; error?: string }> {
    try {
      await db.execute(sql`SELECT 1`);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      return { connectionOk: false, tablesExist: false, error: errorMsg || "Không thể kết nối đến cơ sở dữ liệu." };
    }

    try {
      await db.select().from(users).limit(1);
      return { connectionOk: true, tablesExist: true };
    } catch {
      return { connectionOk: true, tablesExist: false, error: "Bảng không tồn tại hoặc cơ cấu schema chưa được đồng bộ." };
    }
  }

  async saveConfiguration(data: {
    siteName: string;
    siteUrl: string;
    siteLogo?: string | null;
    siteFavicon?: string | null;
    siteMetaDescription?: string | null;
    siteMetaKeywords?: string | null;
    siteMetaAuthor?: string | null;
    siteOgImage?: string | null;
    siteColor: string;
    siteTimezone: string;
    siteLanguage: string;
    siteCurrency: string;
    admin: {
      id: string;
      name: string;
      email: string;
      username: string;
      passwordHash: string;
    };
  }): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(settings).values({
        siteName: data.siteName,
        siteUrl: data.siteUrl,
        siteLogo: data.siteLogo,
        siteFavicon: data.siteFavicon,
        siteMetaDescription: data.siteMetaDescription,
        siteMetaKeywords: data.siteMetaKeywords,
        siteMetaAuthor: data.siteMetaAuthor,
        siteOgImage: data.siteOgImage,
        siteColor: data.siteColor,
        siteTimezone: data.siteTimezone,
        siteLanguage: data.siteLanguage,
        siteCurrency: data.siteCurrency,
      });

      await tx.insert(users).values({
        id: data.admin.id,
        name: data.admin.name,
        email: data.admin.email,
        username: data.admin.username,
        emailVerified: true,
        role: "admin",
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const providerId = uuidv7();
      await tx.insert(provider).values({
        id: providerId,
        userId: data.admin.id,
        providerId: "credential",
        accountId: data.admin.id,
        password: data.admin.passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (DEFAULT_EXTENSIONS && DEFAULT_EXTENSIONS.length > 0) {
        const existingExtensions = await tx.select().from(extensions).limit(1);
        if (existingExtensions.length === 0) {
          await tx.insert(extensions).values(
            DEFAULT_EXTENSIONS.map((ext) => ({
              id: ext.id,
              name: ext.name,
              description: ext.description,
              isEnabled: ext.isEnabled,
              config: ext.config,
            }))
          );
        }
      }
    });
  }
}

export const configurationRepository = new ConfigurationRepository();
