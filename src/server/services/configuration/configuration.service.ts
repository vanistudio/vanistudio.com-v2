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
