import { db } from "@/server/db";
import { notificationTemplates, type NotificationTemplate } from "@/server/db/schemas/template.schema";
import { DEFAULT_NOTIFICATION_TEMPLATES } from "@/defaults/templates.default";
import { eq } from "drizzle-orm";

export class NotificationTemplatesRepository {
  async getAllTemplates(): Promise<NotificationTemplate[]> {
    const dbTemplates = await db.select().from(notificationTemplates);
    const dbKeys = new Set(dbTemplates.map((t) => `${t.eventKey}_${t.channel}_${t.target}`));
    const missing = DEFAULT_NOTIFICATION_TEMPLATES.filter(
      (def) => !dbKeys.has(`${def.eventKey}_${def.channel}_${def.target}`)
    );

    if (missing.length > 0) {
      await db.insert(notificationTemplates).values(
        missing.map((m) => ({
          name: m.name,
          eventKey: m.eventKey,
          channel: m.channel,
          target: m.target,
          subject: m.subject || null,
          content: m.content,
          variables: m.variables,
          extraConfig: m.extraConfig,
          description: m.description || null,
          isActive: m.isActive,
        }))
      ).onConflictDoNothing();
      return db.select().from(notificationTemplates);
    }

    return dbTemplates;
  }

  async getTemplateById(id: string): Promise<NotificationTemplate | null> {
    const [result] = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.id, id))
      .limit(1);
    return result || null;
  }

  async updateTemplate(
    id: string,
    data: Partial<Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">>
  ): Promise<NotificationTemplate> {
    const [updated] = await db
      .update(notificationTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id))
      .returning();
    if (!updated) {
      throw new Error("Không tìm thấy mẫu thông báo để cập nhật");
    }
    return updated;
  }
}

export const notificationTemplatesRepository = new NotificationTemplatesRepository();
