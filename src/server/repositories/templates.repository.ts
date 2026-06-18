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

  async resetTemplateToDefault(id: string): Promise<NotificationTemplate> {
    const existing = await this.getTemplateById(id);
    if (!existing) {
      throw new Error("Không tìm thấy mẫu thông báo để khôi phục");
    }

    const defaultTpl = DEFAULT_NOTIFICATION_TEMPLATES.find(
      (d) => d.eventKey === existing.eventKey && d.channel === existing.channel && d.target === existing.target
    );

    if (!defaultTpl) {
      throw new Error("Không tìm thấy cấu hình mặc định cho mẫu thông báo này");
    }

    return await this.updateTemplate(id, {
      name: defaultTpl.name,
      subject: defaultTpl.subject || null,
      content: defaultTpl.content,
      variables: defaultTpl.variables,
      extraConfig: defaultTpl.extraConfig,
      description: defaultTpl.description || null,
      isActive: defaultTpl.isActive,
    });
  }

  async resetAllTemplatesToDefault(): Promise<NotificationTemplate[]> {
    const dbTemplates = await db.select().from(notificationTemplates);
    const results: NotificationTemplate[] = [];

    for (const existing of dbTemplates) {
      const defaultTpl = DEFAULT_NOTIFICATION_TEMPLATES.find(
        (d) => d.eventKey === existing.eventKey && d.channel === existing.channel && d.target === existing.target
      );
      if (defaultTpl) {
        const updated = await this.updateTemplate(existing.id, {
          name: defaultTpl.name,
          subject: defaultTpl.subject || null,
          content: defaultTpl.content,
          variables: defaultTpl.variables,
          extraConfig: defaultTpl.extraConfig,
          description: defaultTpl.description || null,
          isActive: defaultTpl.isActive,
        });
        results.push(updated);
      } else {
        results.push(existing);
      }
    }

    return results;
  }
}

export const notificationTemplatesRepository = new NotificationTemplatesRepository();
