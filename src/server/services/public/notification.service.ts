import { db } from "@/server/db";
import { notificationLogs } from "@/server/db/schemas/notification.schema";
import { notificationTemplates } from "@/server/db/schemas/template.schema";
import { extensionsRepository } from "@/server/repositories/extensions.repository";
import { eq } from "drizzle-orm";
import * as telegramIO from "@/server/io/_notifications/telegram.io";
import * as discordIO from "@/server/io/_notifications/discord.io";
import * as slackIO from "@/server/io/_notifications/slack.io";
import * as emailIO from "@/server/io/_notifications/email.io";

export class NotificationService {
  async trigger(eventKey: string, variables: Record<string, string>) {
    const ext = await extensionsRepository.getExtensionById("notification_config");
    if (!ext || !ext.isEnabled) return;

    const config = ext.config as any;
    if (!config) return;

    const hasSmtpTrigger = (config.smtpServers || []).some(
      (s: any) => s.isEnabled && s.triggers?.includes(eventKey)
    );
    const hasTelegramTrigger =
      (config.clientTelegramBot?.isEnabled && config.clientTelegramBot?.triggers?.includes(eventKey)) ||
      (config.adminTelegramBots || []).some((b: any) => b.isEnabled && b.triggers?.includes(eventKey));
    const hasDiscordTrigger =
      (config.clientDiscordWebhook?.isEnabled && config.clientDiscordWebhook?.triggers?.includes(eventKey)) ||
      (config.adminDiscordWebhooks || []).some((w: any) => w.isEnabled && w.triggers?.includes(eventKey));
    const hasSlackTrigger =
      (config.clientSlackWebhook?.isEnabled && config.clientSlackWebhook?.triggers?.includes(eventKey)) ||
      (config.adminSlackWebhooks || []).some((w: any) => w.isEnabled && w.triggers?.includes(eventKey));

    if (!hasSmtpTrigger && !hasTelegramTrigger && !hasDiscordTrigger && !hasSlackTrigger) {
      return;
    }

    const templates = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.eventKey, eventKey));

    for (const template of templates) {
      const compiledContent = this.compile(template.content, variables);
      const compiledSubject = template.subject ? this.compile(template.subject, variables) : undefined;

      if (template.channel === "email") {
        const smtpServers = config.smtpServers || [];
        const matchingServers = smtpServers.filter(
          (s: any) => s.isEnabled && s.triggers?.includes(eventKey)
        );

        for (const server of matchingServers) {
          const recipient = variables.email || server.fromEmail;
          try {
            await emailIO.sendMessage(server, {
              to: recipient,
              subject: compiledSubject || "Thông báo từ hệ thống",
              html: compiledContent,
              fromName: template.extraConfig?.senderName,
            });

            await db.insert(notificationLogs).values({
              eventKey,
              channel: "email",
              recipient,
              subject: compiledSubject || "Thông báo từ hệ thống",
              content: compiledContent,
              status: "success",
            });
          } catch (err: any) {
            await db.insert(notificationLogs).values({
              eventKey,
              channel: "email",
              recipient: recipient || "unknown",
              subject: compiledSubject || "Thông báo từ hệ thống",
              content: compiledContent,
              status: "failed",
              errorMessage: err.message,
            });
          }
        }
      }

      if (template.channel === "telegram") {
        const bots = [];
        if (config.clientTelegramBot?.isEnabled && config.clientTelegramBot?.triggers?.includes(eventKey)) {
          bots.push(config.clientTelegramBot);
        }
        if (config.adminTelegramBots) {
          const matchingAdminBots = config.adminTelegramBots.filter(
            (b: any) => b.isEnabled && b.triggers?.includes(eventKey)
          );
          bots.push(...matchingAdminBots);
        }

        for (const bot of bots) {
          try {
            const telegramInlineKeyboard = template.extraConfig?.telegramInlineKeyboard
              ? this.compileJson(template.extraConfig.telegramInlineKeyboard, variables)
              : undefined;

            await telegramIO.sendMessage(bot.botToken, bot.chatId, compiledContent, {
              telegramInlineKeyboard,
            });

            await db.insert(notificationLogs).values({
              eventKey,
              channel: "telegram",
              recipient: bot.chatId,
              content: compiledContent,
              status: "success",
            });
          } catch (err: any) {
            await db.insert(notificationLogs).values({
              eventKey,
              channel: "telegram",
              recipient: bot.chatId || "unknown",
              content: compiledContent,
              status: "failed",
              errorMessage: err.message,
            });
          }
        }
      }

      if (template.channel === "discord") {
        const webhooks = [];
        if (config.clientDiscordWebhook?.isEnabled && config.clientDiscordWebhook?.triggers?.includes(eventKey)) {
          webhooks.push(config.clientDiscordWebhook);
        }
        if (config.adminDiscordWebhooks) {
          const matchingAdminWebhooks = config.adminDiscordWebhooks.filter(
            (w: any) => w.isEnabled && w.triggers?.includes(eventKey)
          );
          webhooks.push(...matchingAdminWebhooks);
        }

        for (const webhook of webhooks) {
          try {
            const embeds = template.extraConfig?.discordEmbeds
              ? this.compileJson(template.extraConfig.discordEmbeds, variables)
              : undefined;

            await discordIO.sendMessage(webhook.webhookUrl, compiledContent, {
              embeds,
            });

            await db.insert(notificationLogs).values({
              eventKey,
              channel: "discord",
              recipient: webhook.webhookUrl,
              content: compiledContent,
              status: "success",
            });
          } catch (err: any) {
            await db.insert(notificationLogs).values({
              eventKey,
              channel: "discord",
              recipient: webhook.webhookUrl || "unknown",
              content: compiledContent,
              status: "failed",
              errorMessage: err.message,
            });
          }
        }
      }

      if (template.channel === "slack") {
        const webhooks = [];
        if (config.clientSlackWebhook?.isEnabled && config.clientSlackWebhook?.triggers?.includes(eventKey)) {
          webhooks.push(config.clientSlackWebhook);
        }
        if (config.adminSlackWebhooks) {
          const matchingAdminWebhooks = config.adminSlackWebhooks.filter(
            (w: any) => w.isEnabled && w.triggers?.includes(eventKey)
          );
          webhooks.push(...matchingAdminWebhooks);
        }

        for (const webhook of webhooks) {
          try {
            const blocks = template.extraConfig?.slackBlocks
              ? this.compileJson(template.extraConfig.slackBlocks, variables)
              : undefined;

            await slackIO.sendMessage(webhook.webhookUrl, compiledContent, {
              blocks,
            });

            await db.insert(notificationLogs).values({
              eventKey,
              channel: "slack",
              recipient: webhook.webhookUrl,
              content: compiledContent,
              status: "success",
            });
          } catch (err: any) {
            await db.insert(notificationLogs).values({
              eventKey,
              channel: "slack",
              recipient: webhook.webhookUrl || "unknown",
              content: compiledContent,
              status: "failed",
              errorMessage: err.message,
            });
          }
        }
      }
    }
  }

  private compile(content: string, variables: Record<string, string>): string {
    let compiled = content;
    for (const [key, val] of Object.entries(variables)) {
      compiled = compiled.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val || "");
    }
    return compiled;
  }

  private compileJson<T>(obj: T, variables: Record<string, string>): T {
    if (!obj) return obj;
    try {
      const str = JSON.stringify(obj);
      const compiledStr = this.compile(str, variables);
      return JSON.parse(compiledStr);
    } catch {
      return obj;
    }
  }
}

export const notificationService = new NotificationService();
