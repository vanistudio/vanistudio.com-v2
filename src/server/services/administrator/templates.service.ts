import { notificationTemplatesRepository } from "@/server/repositories/templates.repository";
import { type NotificationTemplate } from "@/server/db/schemas/template.schema";

export class NotificationTemplatesService {
  async getTemplates() {
    return await notificationTemplatesRepository.getAllTemplates();
  }

  async updateTemplate(
    id: string,
    data: Partial<Omit<NotificationTemplate, "id" | "createdAt" | "updatedAt">>
  ): Promise<NotificationTemplate> {
    return await notificationTemplatesRepository.updateTemplate(id, data);
  }

  async resetTemplateToDefault(id: string): Promise<NotificationTemplate> {
    return await notificationTemplatesRepository.resetTemplateToDefault(id);
  }

  async resetAllTemplatesToDefault(): Promise<NotificationTemplate[]> {
    return await notificationTemplatesRepository.resetAllTemplatesToDefault();
  }
}

export const notificationTemplatesService = new NotificationTemplatesService();
