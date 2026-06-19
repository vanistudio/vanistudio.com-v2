import { db } from "@/server/db";
import { notificationLogs } from "@/server/db/schemas/notification.schema";
import { notificationTemplates } from "@/server/db/schemas/template.schema";
import { extensionsRepository } from "@/server/repositories/extensions.repository";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";

export class NotificationService {
  async trigger(eventKey: string, variables: Record<string, string>) {
    const ext = await extensionsRepository.getExtensionById("notification_config");
    if (!ext || !ext.isEnabled) return;

    const config = ext.config as any;
    if (!config) return;

    const templates = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.eventKey, eventKey));

    for (const template of templates) {
      if (!template.isActive) continue;

      const compiledContent = this.compile(template.content, variables);
      const compiledSubject = template.subject ? this.compile(template.subject, variables) : undefined;

      if (template.channel === "email") {
        const smtpServers = config.smtpServers || [];
        const matchingServers = smtpServers.filter(
          (s: any) => s.isEnabled && s.triggers?.includes(eventKey)
        );

        for (const server of matchingServers) {
          try {
            const transporter = nodemailer.createTransport({
              host: server.host,
              port: server.port,
              secure: server.secure,
              auth: {
                user: server.user,
                pass: server.pass,
              },
            });

            const senderEmail = template.extraConfig?.senderEmail || server.fromEmail;
            const senderName = template.extraConfig?.senderName || server.fromName;
            const recipient = variables.email || server.fromEmail;

            await transporter.sendMail({
              from: `"${senderName}" <${senderEmail}>`,
              to: recipient,
              subject: compiledSubject || "Thông báo từ hệ thống",
              html: compiledContent,
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
              recipient: variables.email || "unknown",
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
            const res = await fetch(`https://api.telegram.org/bot${bot.botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: bot.chatId,
                text: compiledContent,
                parse_mode: "HTML",
              }),
            });

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(errText);
            }

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
            const res = await fetch(webhook.webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                content: compiledContent,
              }),
            });

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(errText);
            }

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
            const res = await fetch(webhook.webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: compiledContent,
              }),
            });

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(errText);
            }

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
}

export const notificationService = new NotificationService();
