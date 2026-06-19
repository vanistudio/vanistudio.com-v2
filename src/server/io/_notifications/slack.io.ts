import { http } from "@/lib/http";

export async function sendMessage(
  webhookUrl: string,
  text?: string | null,
  options?: { blocks?: any[]; [key: string]: any }
) {
  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    throw new Error("Invalid or missing Slack webhookUrl");
  }

  const body: any = {};
  if (text && text.trim() !== "") {
    body.text = text;
  }
  if (options?.blocks && Array.isArray(options.blocks) && options.blocks.length > 0) {
    body.blocks = options.blocks;
  }

  if (!body.text && (!body.blocks || body.blocks.length === 0)) {
    throw new Error("Slack notification must contain either text or blocks");
  }

  const { blocks, ...rest } = options || {};

  return await http.post(webhookUrl, {
    ...body,
    ...rest,
  });
}

export async function sendToClient(config: any, text?: string | null, options?: { blocks?: any[]; [key: string]: any }) {
  if (!config) return;
  const webhook = config.clientSlackWebhook;
  if (!webhook || !webhook.webhookUrl) return;
  return await sendMessage(webhook.webhookUrl, text, options);
}

export async function sendToAdmin(config: any, text?: string | null, options?: { blocks?: any[]; [key: string]: any }) {
  if (!config) return;
  const webhooks = config.adminSlackWebhooks || [];
  const promises = webhooks.map((webhook: any) => {
    if (!webhook || !webhook.webhookUrl) return Promise.resolve(null);
    return sendMessage(webhook.webhookUrl, text, options).catch((err) => {
      console.error(`Failed to send Slack notification to admin webhook ${webhook.id || ""}:`, err);
      return null;
    });
  });
  return await Promise.all(promises);
}
