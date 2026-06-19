import { http } from "@/lib/http";

function hexColorToDecimal(hex?: string): number | undefined {
  if (!hex) return undefined;
  const cleanHex = hex.replace("#", "");
  const parsed = parseInt(cleanHex, 16);
  return isNaN(parsed) ? undefined : parsed;
}

export async function sendMessage(
  webhookUrl: string,
  content?: string | null,
  options?: { embeds?: any[]; [key: string]: any }
) {
  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    throw new Error("Invalid or missing Discord webhookUrl");
  }

  const body: any = {};
  if (content && content.trim() !== "") {
    body.content = content;
  }

  if (options?.embeds && Array.isArray(options.embeds) && options.embeds.length > 0) {
    body.embeds = options.embeds.map((embed: any) => {
      const color = typeof embed.color === "number" ? embed.color : hexColorToDecimal(embed.colorHex || embed.color);
      const { colorHex, ...restEmbed } = embed;
      return color !== undefined ? { ...restEmbed, color } : restEmbed;
    });
  }

  if (!body.content && (!body.embeds || body.embeds.length === 0)) {
    throw new Error("Discord notification must contain either content or embeds");
  }

  const { embeds, ...rest } = options || {};

  return await http.post(webhookUrl, {
    ...body,
    ...rest,
  });
}

export async function sendToClient(config: any, content?: string | null, options?: { embeds?: any[]; [key: string]: any }) {
  if (!config) return;
  const webhook = config.clientDiscordWebhook;
  if (!webhook || !webhook.webhookUrl) return;
  return await sendMessage(webhook.webhookUrl, content, options);
}

export async function sendToAdmin(config: any, content?: string | null, options?: { embeds?: any[]; [key: string]: any }) {
  if (!config) return;
  const webhooks = config.adminDiscordWebhooks || [];
  const promises = webhooks.map((webhook: any) => {
    if (!webhook || !webhook.webhookUrl) return Promise.resolve(null);
    return sendMessage(webhook.webhookUrl, content, options).catch((err) => {
      console.error(`Failed to send Discord notification to admin webhook ${webhook.id || ""}:`, err);
      return null;
    });
  });
  return await Promise.all(promises);
}
