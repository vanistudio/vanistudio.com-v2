import { configurationRepository } from "@/server/repositories/configuration/configuration.repository";
import bcrypt from "bcryptjs";
import { uuidv7 } from "@/lib/utils";

export class ConfigurationService {
  async checkStatus(): Promise<boolean> {
    return await configurationRepository.checkConfigurationStatus();
  }

  async setupSite(data: {
    siteName: string;
    siteUrl: string;
    admin: {
      name: string;
      email: string;
      password: string;
    };
  }): Promise<void> {
    const isConfigured = await this.checkStatus();
    if (isConfigured) {
      throw new Error("Application has already been configured");
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.admin.password, salt);

    const adminId = uuidv7();

    await configurationRepository.saveConfiguration({
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      admin: {
        id: adminId,
        name: data.admin.name,
        email: data.admin.email,
        passwordHash,
      },
    });
  }
}

export const configurationService = new ConfigurationService();
