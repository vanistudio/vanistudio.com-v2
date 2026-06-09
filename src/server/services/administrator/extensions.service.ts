import { extensionsRepository } from "@/server/repositories/administrator/extensions.repository";

export class ExtensionsService {
  async getAllExtensions() {
    return await extensionsRepository.getAllExtensions();
  }

  async updateExtension(id: string, data: { isEnabled?: boolean; config?: Record<string, any> }) {
    return await extensionsRepository.updateExtension(id, data);
  }
}

export const extensionsService = new ExtensionsService();
