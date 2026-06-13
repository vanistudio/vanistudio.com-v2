import { db } from "@/server/db";
import { extensions, type Extension } from "@/server/db/schemas/extension.schema";
import { DEFAULT_EXTENSIONS } from "@/defaults/extension.default";
import { eq } from "drizzle-orm";

export class ExtensionsRepository {
  async getAllExtensions(): Promise<Extension[]> {
    const dbExtensions = await db.select().from(extensions);
    const dbIds = new Set(dbExtensions.map((e) => e.id));

    const missing = DEFAULT_EXTENSIONS.filter((def) => !dbIds.has(def.id));
    if (missing.length > 0) {
      const toInsert = missing.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        isEnabled: m.isEnabled,
        config: m.config,
      }));
      await db.insert(extensions).values(toInsert).onConflictDoNothing();
      return this.getAllExtensions();
    }

    return dbExtensions.map((dbExt) => {
      const defaultExt = DEFAULT_EXTENSIONS.find((def) => def.id === dbExt.id);
      if (!defaultExt) return dbExt;

      const defaultExtConfig = defaultExt.config as Record<string, any>;
      const dbExtConfig = dbExt.config as Record<string, any>;
      const mergedConfig = { ...defaultExtConfig, ...dbExtConfig };
      if (defaultExtConfig?.fields && dbExtConfig?.fields) {
        mergedConfig.fields = {
          ...defaultExtConfig.fields,
          ...dbExtConfig.fields,
        };
      }

      return {
        ...dbExt,
        config: mergedConfig,
      };
    });
  }

  async getExtensionById(id: string): Promise<Extension | null> {
    const [result] = await db.select().from(extensions).where(eq(extensions.id, id)).limit(1);
    if (!result) {
      const defaultExt = DEFAULT_EXTENSIONS.find((e) => e.id === id);
      if (defaultExt) {
        const [inserted] = await db
          .insert(extensions)
          .values({
            id: defaultExt.id,
            name: defaultExt.name,
            description: defaultExt.description,
            isEnabled: defaultExt.isEnabled,
            config: defaultExt.config,
          })
          .onConflictDoNothing()
          .returning();
        return inserted || defaultExt;
      }
    }

    if (result) {
      const defaultExt = DEFAULT_EXTENSIONS.find((e) => e.id === id);
      if (defaultExt) {
        const defaultExtConfig = defaultExt.config as Record<string, any>;
        const resultConfig = result.config as Record<string, any>;
        const mergedConfig = { ...defaultExtConfig, ...resultConfig };
        if (defaultExtConfig?.fields && resultConfig?.fields) {
          mergedConfig.fields = {
            ...defaultExtConfig.fields,
            ...resultConfig.fields,
          };
        }
        return {
          ...result,
          config: mergedConfig,
        };
      }
    }
    return result || null;
  }

  async updateExtension(
    id: string,
    data: { isEnabled?: boolean; config?: Record<string, any> }
  ): Promise<Extension> {
    if (id === "user_registration_customizer" && data.config) {
      const config = data.config as any;
      const fields = config.fields || {};
      const emailShow = fields.email?.show ?? true;
      const phoneShow = fields.phone?.show ?? true;
      const usernameShow = fields.username?.show ?? true;
      if (!emailShow && !phoneShow && !usernameShow) {
        throw new Error("Không thể tắt đồng thời cả 3 trường nhận diện chính: Email, Số điện thoại và Tên đăng nhập.");
      }
    }

    const updateData: any = { updatedAt: new Date() };
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
    if (data.config !== undefined) updateData.config = data.config;

    const [updated] = await db
      .update(extensions)
      .set(updateData)
      .where(eq(extensions.id, id))
      .returning();

    if (!updated) {
      const defaultExt = DEFAULT_EXTENSIONS.find((e) => e.id === id);
      if (defaultExt) {
        const [inserted] = await db
          .insert(extensions)
          .values({
            id: defaultExt.id,
            name: defaultExt.name,
            description: defaultExt.description,
            isEnabled: data.isEnabled !== undefined ? data.isEnabled : defaultExt.isEnabled,
            config: data.config !== undefined ? data.config : defaultExt.config,
          })
          .returning();
        return inserted;
      }
      throw new Error("Không tìm thấy gói mở rộng để cập nhật");
    }
    return updated;
  }
}

export const extensionsRepository = new ExtensionsRepository();
