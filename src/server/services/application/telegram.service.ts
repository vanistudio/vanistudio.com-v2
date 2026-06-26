import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { telegramRepository } from "@/server/repositories/telegram.repository";
import { parseProxy, checkTelegramProxy } from "@/server/io/_others/telegram.io";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "2040");
const apiHash = process.env.TELEGRAM_API_HASH || "b18441a1ab607e118b53b8785ef7a575";



interface LoginSession {
  client: TelegramClient;
  phone: string;
  phoneCodeHash: string;
  proxy?: string;
}

const globalForTelegram = globalThis as unknown as {
  telegramLoginSessions: Map<string, LoginSession> | undefined;
  activeSelfbots: Map<string, TelegramClient> | undefined;
  lastReplyMap: Map<string, number> | undefined;
};

if (!globalForTelegram.telegramLoginSessions) {
  globalForTelegram.telegramLoginSessions = new Map();
}
if (!globalForTelegram.activeSelfbots) {
  globalForTelegram.activeSelfbots = new Map();
}
if (!globalForTelegram.lastReplyMap) {
  globalForTelegram.lastReplyMap = new Map();
}

const loginSessions = globalForTelegram.telegramLoginSessions;
const activeSelfbots = globalForTelegram.activeSelfbots;
const lastReplyMap = globalForTelegram.lastReplyMap;

export class TelegramService {
  private initialized = false;

  async initAllSelfbots() {
    if (this.initialized) return;
    this.initialized = true;
    try {
    } catch (err) {
      console.error("Error during Telegram selfbot auto-initialization:", err);
    }
  }

  async sendLoginCode(userId: string, phone: string, proxy?: string) {
    await this.initAllSelfbots();

    const oldSession = loginSessions.get(phone);
    if (oldSession) {
      try {
        await oldSession.client.disconnect();
      } catch {}
      loginSessions.delete(phone);
    }

    const proxyConfig = proxy ? parseProxy(proxy) : undefined;
    const client = new TelegramClient(
      new StringSession(""),
      apiId,
      apiHash,
      {
        connectionRetries: 5,
        proxy: proxyConfig,
      }
    );

    await client.connect();

    const result = await client.sendCode(
      {
        apiId,
        apiHash,
      },
      phone
    );

    loginSessions.set(phone, {
      client,
      phone,
      phoneCodeHash: result.phoneCodeHash,
      proxy,
    });

    return {
      success: true,
      phoneCodeHash: result.phoneCodeHash,
    };
  }

  async submitLoginCode(userId: string, phone: string, code: string, password?: string) {
    const session = loginSessions.get(phone);
    if (!session) {
      throw new Error("Không tìm thấy phiên yêu cầu OTP. Vui lòng gửi lại mã OTP.");
    }

    const { client, phoneCodeHash, proxy } = session;

    try {
      if (password) {
        await client.signInWithPassword(
          { apiId, apiHash },
          {
            password: async () => password,
            onError: (err) => {
              throw err;
            },
          }
        );
      } else {
        await client.invoke(
          new Api.auth.SignIn({
            phoneNumber: phone,
            phoneCodeHash,
            phoneCode: code,
          })
        );
      }
    } catch (err: any) {
      if (
        err.errorMessage === "SESSION_PASSWORD_NEEDED" ||
        err.message?.includes("SESSION_PASSWORD_NEEDED")
      ) {
        return { need2FA: true };
      }
      throw err;
    }

    const sessionString = (client.session as any).save() as string;
    const me = (await client.getMe()) as any;

    const firstName = me.firstName || null;
    const lastName = me.lastName || null;
    const username = me.username || null;
    const telegramId = me.id.toString();

    let avatar: string | null = null;
    try {
      const buffer = await client.downloadProfilePhoto("me");
      if (buffer && buffer.length > 0) {
        avatar = `data:image/jpeg;base64,${Buffer.from(buffer).toString("base64")}`;
      }
    } catch (photoError) {
      console.error("Failed to download profile photo at login:", photoError);
    }

    const existing = await telegramRepository.getAccountByPhone(phone, userId);
    let accountId: string;

    if (existing) {
      accountId = existing.id;
      await telegramRepository.updateAccount(existing.id, userId, {
        sessionString,
        telegramId,
        username,
        firstName,
        lastName,
        avatar,
        proxy: proxy || null,
        proxyStatus: "active",
        status: "active",
        lastProxyCheckAt: new Date(),
      });
    } else {
      const newAcc = await telegramRepository.createAccount({
        userId,
        phone,
        sessionString,
        telegramId,
        username,
        firstName,
        lastName,
        avatar,
        proxy: proxy || null,
        proxyStatus: "active",
        status: "active",
        lastProxyCheckAt: new Date(),
      });
      accountId = newAcc.id;

      await telegramRepository.createAutoResponder({
        accountId: newAcc.id,
        isActive: true,
        replyText: "Chào bạn, hiện tại mình đang không online trên Telegram. Mình sẽ phản hồi lại ngay khi có thể! Cảm ơn bạn.",
        detectionMode: "idle",
        inactivityMinutes: 10,
        workDays: [1, 2, 3, 4, 5],
        workStartHour: "08:00",
        workEndHour: "17:30",
        timezone: "Asia/Ho_Chi_Minh",
        cooldownHours: 4,
        markAsRead: false,
      });
    }

    loginSessions.delete(phone);
    await this.startSelfbot(accountId, userId);

    return {
      success: true,
      accountId,
    };
  }

  async startSelfbot(accountId: string, userId: string) {
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) return;

    await this.stopSelfbot(accountId);

    const proxyConfig = account.proxy ? parseProxy(account.proxy) : undefined;
    const client = new TelegramClient(
      new StringSession(account.sessionString),
      apiId,
      apiHash,
      {
        connectionRetries: 5,
        proxy: proxyConfig,
      }
    );

    try {
      await client.connect();
      
      try {
        const me = (await client.getMe()) as any;
        const firstName = me.firstName || null;
        const lastName = me.lastName || null;
        const username = me.username || null;
        const telegramId = me.id.toString();
        
        let avatar: string | null = null;
        try {
          const buffer = await client.downloadProfilePhoto("me");
          if (buffer && buffer.length > 0) {
            avatar = `data:image/jpeg;base64,${Buffer.from(buffer).toString("base64")}`;
          }
        } catch (photoError) {
          console.error("Failed to download profile photo in startSelfbot:", photoError);
        }

        await telegramRepository.updateAccount(accountId, userId, {
          telegramId,
          username,
          firstName,
          lastName,
          ...(avatar ? { avatar } : {}),
          ...(account.proxy ? { proxyStatus: "active", lastProxyCheckAt: new Date() } : {})
        });
      } catch (meError) {
        console.error("Failed to update profile details during connection:", meError);
        if (account.proxy) {
          await telegramRepository.updateAccount(accountId, userId, {
            proxyStatus: "active",
            lastProxyCheckAt: new Date(),
          });
        }
      }
    } catch (err: any) {
      console.error(`Failed to connect selfbot client ${account.phone}:`, err);
      await telegramRepository.updateAccount(accountId, userId, {
        proxyStatus: "dead",
        status: "disconnected",
        lastProxyCheckAt: new Date(),
      });
      await telegramRepository.createLog({
        accountId,
        actionType: "proxy_error",
        status: "failed",
        message: `Lỗi kết nối SOCKS5 Proxy hoặc Session đã bị thu hồi: ${err.message}`,
        details: { error: err.message },
      });
      return;
    }

    client.addEventHandler(async (event) => {
      try {
        const message = event.message;
        if (!message || message.out) return;

        const config = await telegramRepository.getAutoResponder(accountId);
        if (!config || !config.isActive) return;

        if (config.markAsRead && message.peerId) {
          try {
            await client.invoke(new Api.messages.ReadHistory({ peer: message.peerId, maxId: message.id }));
          } catch {}
        }

        const sender = (await message.getSender()) as any;
        if (!sender) return;

        if (config.markAsRead && sender.bot) {
          return;
        }

        const senderId = sender.id ? String(sender.id) : "";
        const isGroup = message.isGroup || message.isChannel;
        if (isGroup) return;

        const cooldownKey = `${accountId}:${senderId}`;
        const lastReplyTime = lastReplyMap.get(cooldownKey) || 0;
        const cooldownMs = config.cooldownHours * 60 * 60 * 1000;
        if (Date.now() - lastReplyTime < cooldownMs) {
          return;
        }

        if (config.detectionMode === "outside_work_hours") {
          const tz = config.timezone || "Asia/Ho_Chi_Minh";
          const now = new Date();
          const tzString = now.toLocaleTimeString("en-US", { timeZone: tz, hour12: false });
          const [currentHour, currentMin] = tzString.split(":").map(Number);
          const currentDay = now.toLocaleDateString("en-US", { timeZone: tz, weekday: "short" });
          const dayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
          const currentDayNum = dayMap[currentDay] || 1;

          const isWorkDay = config.workDays.includes(currentDayNum);
          if (isWorkDay) {
            const [startH, startM] = config.workStartHour.split(":").map(Number);
            const [endH, endM] = config.workEndHour.split(":").map(Number);
            const currentTotalMin = currentHour * 60 + currentMin;
            const startTotalMin = startH * 60 + startM;
            const endTotalMin = endH * 60 + endM;

            if (currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin) {
              return;
            }
          }
        }

        if (config.detectionMode === "idle") {
        }

        const delaySeconds = 5;
        await new Promise((r) => setTimeout(r, delaySeconds * 1000));

        if (message.peerId) {
          await client.sendMessage(message.peerId, {
            message: config.replyText,
          });
        }

        lastReplyMap.set(cooldownKey, Date.now());

        await telegramRepository.createLog({
          accountId,
          actionType: "auto_reply",
          status: "success",
          message: `Đã tự động phản hồi thành công đến ${sender.username || sender.firstName || "khách hàng"}.`,
          details: {
            senderId,
            senderName: `${sender.firstName || ""} ${sender.lastName || ""}`.trim(),
            replyText: config.replyText,
          },
        });
      } catch (err: any) {
        console.error("Error handling selfbot auto-reply event:", err);
      }
    }, new NewMessage({}));

    activeSelfbots.set(accountId, client);

    await telegramRepository.createLog({
      accountId,
      actionType: "connection",
      status: "success",
      message: "Thiết lập kết nối với Telegram API thành công và đang hoạt động.",
      details: { phone: account.phone },
    });
  }

  async stopSelfbot(accountId: string) {
    const client = activeSelfbots.get(accountId);
    if (client) {
      try {
        await client.disconnect();
      } catch {}
      activeSelfbots.delete(accountId);
    }
  }

  async getAccounts(userId: string) {
    await this.initAllSelfbots();

    const accounts = await telegramRepository.getAccounts(userId);
    for (const acc of accounts) {
      if (!activeSelfbots.has(acc.id) && acc.status === "active") {
        this.startSelfbot(acc.id, userId).catch(() => {});
      }
    }
    return accounts;
  }

  async getAccountsList(userId: string, params: any) {
    await this.initAllSelfbots();
    const result = await telegramRepository.getAccountsList(userId, params);

    for (const acc of result.items) {
      if (!activeSelfbots.has(acc.id) && acc.status === "active") {
        this.startSelfbot(acc.id, userId).catch(() => {});
      }
    }

    return {
      resultCode: 0,
      message: "Success",
      data: result,
    };
  }

  async updateProxy(accountId: string, userId: string, proxy: string | null) {
    await this.initAllSelfbots();
    const updated = await telegramRepository.updateAccount(accountId, userId, {
      proxy,
      proxyStatus: proxy ? "unknown" : "inactive",
    });
    await this.startSelfbot(accountId, userId);
    return updated;
  }

  async deleteAccount(accountId: string, userId: string) {
    await this.initAllSelfbots();
    await this.stopSelfbot(accountId);
    await telegramRepository.deleteAccount(accountId, userId);
  }

  async checkProxy(accountId: string, userId: string) {
    await this.initAllSelfbots();
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");

    if (!account.proxy) {
      return { success: false, message: "Tài khoản không được cấu hình proxy" };
    }

    const res = await checkTelegramProxy(account.proxy, apiId, apiHash);

    await telegramRepository.updateAccount(accountId, userId, {
      proxyStatus: res.success ? "active" : "dead",
      lastProxyCheckAt: new Date(),
    });

    return res;
  }

  async getAutoResponder(accountId: string, userId: string) {
    await this.initAllSelfbots();
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");

    let ar = await telegramRepository.getAutoResponder(accountId);
    if (!ar) {
      ar = await telegramRepository.createAutoResponder({
        accountId,
        isActive: true,
        replyText: "Chào bạn, hiện tại mình đang không online trên Telegram. Mình sẽ phản hồi lại ngay khi có thể! Cảm ơn bạn.",
        detectionMode: "idle",
        inactivityMinutes: 10,
        workDays: [1, 2, 3, 4, 5],
        workStartHour: "08:00",
        workEndHour: "17:30",
        timezone: "Asia/Ho_Chi_Minh",
        cooldownHours: 4,
        markAsRead: false,
      });
    }
    return ar;
  }

  async updateAutoResponder(accountId: string, userId: string, data: any) {
    await this.initAllSelfbots();
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");

    return await telegramRepository.updateAutoResponderByAccountId(accountId, {
      isActive: data.isActive,
      replyText: data.replyText,
      detectionMode: data.detectionMode,
      inactivityMinutes: data.inactivityMinutes,
      workDays: data.workDays,
      workStartHour: data.workStartHour,
      workEndHour: data.workEndHour,
      timezone: data.timezone,
      cooldownHours: data.cooldownHours,
      markAsRead: data.markAsRead,
    });
  }

  async getLogs(accountId: string, userId: string) {
    await this.initAllSelfbots();
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");

    return await telegramRepository.getLogs(accountId);
  }

  async getLogsList(accountId: string, userId: string, params: any) {
    await this.initAllSelfbots();
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");

    const result = await telegramRepository.getLogsList(accountId, params);
    return {
      resultCode: 0,
      message: "Success",
      data: result,
    };
  }

  async getAccountStats(accountId: string, userId: string) {
    await this.initAllSelfbots();
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");

    const client = activeSelfbots.get(accountId);
    const isOnline = client ? client.connected : false;

    let stats = {
      isOnline,
      isPremium: false,
      groupsCount: 0,
      channelsCount: 0,
      usersCount: 0,
      unreadCount: 0,
      isRestricted: false,
      restrictionReason: null as string | null,
    };

    if (client && isOnline) {
      try {
        const me = (await client.getMe()) as any;
        stats.isPremium = me?.premium || false;
        stats.isRestricted = me?.restricted || false;
        stats.restrictionReason = me?.restrictionReason ? JSON.stringify(me.restrictionReason) : null;

        const dialogs = await client.getDialogs({});
        for (const d of dialogs) {
          if (d.isGroup) {
            stats.groupsCount++;
          } else if (d.isChannel) {
            stats.channelsCount++;
          } else if (d.isUser) {
            stats.usersCount++;
          }
          if (d.unreadCount && d.unreadCount > 0) {
            stats.unreadCount += d.unreadCount;
          }
        }
      } catch (err) {
        console.error("Failed to fetch client stats in getAccountStats:", err);
      }
    }

    return stats;
  }

  async clearLogs(accountId: string, userId: string) {
    await this.initAllSelfbots();
    const account = await telegramRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");

    await telegramRepository.clearLogs(accountId);
  }
}

export const telegramService = new TelegramService();
