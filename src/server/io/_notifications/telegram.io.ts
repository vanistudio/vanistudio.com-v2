import { http } from "@/lib/http";

function cleanTelegramUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.includes("{{") || url.includes("}}")) {
    return undefined;
  }
  return url;
}

function parseTelegramReplyMarkup(customKeyboard: any) {
  if (!customKeyboard) return undefined;

  if (customKeyboard.inline_keyboard && Array.isArray(customKeyboard.inline_keyboard)) {
    const inline_keyboard = customKeyboard.inline_keyboard
      .map((row: any) => {
        if (!Array.isArray(row)) return [];
        return row
          .map((btn: any) => {
            if (btn.url) {
              const cleanedUrl = cleanTelegramUrl(btn.url);
              return cleanedUrl ? { ...btn, url: cleanedUrl } : null;
            }
            return btn;
          })
          .filter(Boolean);
      })
      .filter((row: any) => row.length > 0);
    return inline_keyboard.length > 0 ? { inline_keyboard } : undefined;
  }

  if (Array.isArray(customKeyboard.rows)) {
    const inline_keyboard = customKeyboard.rows
      .map((row: any) => {
        const buttons = Array.isArray(row.buttons) ? row.buttons : [];
        const cleanButtons = buttons
          .map((btn: any) => {
            const cleanedUrl = cleanTelegramUrl(btn.url);
            if (cleanedUrl) {
              return { text: btn.text, url: cleanedUrl };
            }
            if (btn.callbackData) {
              return { text: btn.text, callback_data: btn.callbackData };
            }
            return null;
          })
          .filter(Boolean);
        return cleanButtons;
      })
      .filter((row: any) => row.length > 0);
    return inline_keyboard.length > 0 ? { inline_keyboard } : undefined;
  }

  return undefined;
}

export async function sendMessage(
  botToken: string,
  chatId: string,
  text: string,
  options?: { reply_markup?: any; telegramInlineKeyboard?: any; [key: string]: any }
) {
  if (!botToken || !chatId) {
    throw new Error("Missing Telegram botToken or chatId");
  }

  if (!text || text.trim() === "") {
    throw new Error("Telegram message text cannot be empty");
  }

  let cleanText = text;
  if (cleanText.length > 4096) {
    cleanText = cleanText.substring(0, 4090) + "...";
  }

  const body: any = {
    chat_id: chatId,
    text: cleanText,
    parse_mode: "HTML",
  };

  const replyMarkup = options?.reply_markup || parseTelegramReplyMarkup(options?.telegramInlineKeyboard);
  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const { reply_markup, telegramInlineKeyboard, ...rest } = options || {};

  return await http.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    ...body,
    ...rest,
  });
}

export async function sendToClient(
  config: any,
  text: string,
  options?: { reply_markup?: any; telegramInlineKeyboard?: any; [key: string]: any }
) {
  if (!config) return;
  const bot = config.clientTelegramBot;
  if (!bot || !bot.botToken || !bot.chatId) return;
  return await sendMessage(bot.botToken, bot.chatId, text, options);
}

export async function sendToAdmin(
  config: any,
  text: string,
  options?: { reply_markup?: any; telegramInlineKeyboard?: any; [key: string]: any }
) {
  if (!config) return;
  const bots = config.adminTelegramBots || [];
  const promises = bots.map((bot: any) => {
    if (!bot || !bot.botToken || !bot.chatId) return Promise.resolve(null);
    return sendMessage(bot.botToken, bot.chatId, text, options).catch((err) => {
      console.error(`Failed to send Telegram notification to admin bot ${bot.id || ""}:`, err);
      return null;
    });
  });
  return await Promise.all(promises);
}
