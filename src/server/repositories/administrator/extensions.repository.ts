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
      return await db.select().from(extensions);
    }

    return dbExtensions;
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
    return result || null;
  }

  async updateExtension(
    id: string,
    data: { isEnabled?: boolean; config?: Record<string, any> }
  ): Promise<Extension> {
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
