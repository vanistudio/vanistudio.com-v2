import { db } from "@/server/db";
import { settings } from "@/server/db/schemas/setting.schema";
import { users, provider } from "@/server/db/schemas/user.schema";
import { extensions } from "@/server/db/schemas/extension.schema";
import { DEFAULT_EXTENSIONS } from "@/defaults/extension.default";
import { eq, sql } from "drizzle-orm";
import { uuidv7 } from "@/lib/utils";
import { menuGroups, menus } from "@/server/db/schemas/menu.schema";
import { DEFAULT_MENU_GROUPS } from "@/defaults/menu.default";
import { cmsPages } from "@/server/db/schemas/cms-page.schema";
import { DEFAULT_CMS_PAGES } from "@/defaults/cms-page.default";
import { notificationTemplates } from "@/server/db/schemas/template.schema";
import { DEFAULT_NOTIFICATION_TEMPLATES } from "@/defaults/templates.default";


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

      if (DEFAULT_MENU_GROUPS && DEFAULT_MENU_GROUPS.length > 0) {
        const existingMenuGroups = await tx.select().from(menuGroups).limit(1);
        if (existingMenuGroups.length === 0) {
          for (const group of DEFAULT_MENU_GROUPS) {
            const [insertedGroup] = await tx.insert(menuGroups).values({
              name: group.name,
              key: group.key,
              description: group.description,
              isActive: true,
            }).returning();

            const seedMenuItems = async (items: any[], groupId: string, parentId: string | null = null) => {
              for (const item of items) {
                const [insertedItem] = await tx.insert(menus).values({
                  groupId,
                  parentId,
                  name: item.name,
                  url: item.url || null,
                  icon: item.icon,
                  order: item.order,
                  isActive: true,
                }).returning();

                if (insertedItem && item.children && item.children.length > 0) {
                  await seedMenuItems(item.children, groupId, insertedItem.id);
                }
              }
            };

            if (insertedGroup && group.items.length > 0) {
              await seedMenuItems(group.items, insertedGroup.id);
            }
          }
        }
      }

      if (DEFAULT_CMS_PAGES && DEFAULT_CMS_PAGES.length > 0) {
        const existingPages = await tx.select().from(cmsPages).limit(1);
        if (existingPages.length === 0) {
          await tx.insert(cmsPages).values(
            DEFAULT_CMS_PAGES.map((p) => ({
              title: p.title,
              slug: p.slug,
              description: p.description,
              content: p.content,
              thumbnail: p.thumbnail,
              metaTitle: p.metaTitle,
              metaDescription: p.metaDescription,
              metaKeywords: p.metaKeywords,
              isActive: p.isActive,
              publishedAt: p.publishedAt,
            }))
          );
        }
      }

      if (DEFAULT_NOTIFICATION_TEMPLATES && DEFAULT_NOTIFICATION_TEMPLATES.length > 0) {
        const existingTemplates = await tx.select().from(notificationTemplates).limit(1);
        if (existingTemplates.length === 0) {
          await tx.insert(notificationTemplates).values(
            DEFAULT_NOTIFICATION_TEMPLATES.map((t) => ({
              name: t.name,
              eventKey: t.eventKey,
              channel: t.channel,
              target: t.target,
              subject: t.subject || null,
              content: t.content,
              variables: t.variables,
              extraConfig: t.extraConfig,
              description: t.description || null,
            }))
          );
        }
      }
    });
  }
}

export const configurationRepository = new ConfigurationRepository();
