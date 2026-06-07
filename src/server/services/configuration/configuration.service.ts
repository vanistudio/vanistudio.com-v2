import { configurationRepository } from "@/server/repositories/configuration/configuration.repository";
import bcrypt from "bcryptjs";
import { uuidv7 } from "@/lib/utils";
import { exec } from "child_process";

export class ConfigurationService {
  async checkStatus(): Promise<boolean> {
    return await configurationRepository.checkConfigurationStatus();
  }

  async checkDbStatus(): Promise<{ connectionOk: boolean; tablesExist: boolean; error?: string }> {
    return await configurationRepository.checkDbStatus();
  }

  async pushSchema(): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      exec("npx drizzle-kit push", { env: process.env }, (error, stdout, stderr) => {
        const output = stdout + "\n" + stderr;
        if (error) {
          resolve({ success: false, output, error: error.message });
        } else {
          resolve({ success: true, output });
        }
      });
    });
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
      username: string;
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
        username: data.admin.username,
        passwordHash,
      },
    });
  }
}

export const configurationService = new ConfigurationService();
