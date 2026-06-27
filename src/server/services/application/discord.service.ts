import { discordRepository } from "@/server/repositories/discord.repository";
import { checkDiscordToken } from "@/server/io/_others/discord.io";

export class DiscordService {
  async getAccounts(userId: string) {
    return await discordRepository.getAccounts(userId);
  }

  async getAccountsList(userId: string, params: {
    search?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    status?: string;
  }) {
    const result = await discordRepository.getAccountsList(userId, params);
    return {
      resultCode: 0,
      message: "Success",
      data: result,
    };
  }

  async getAccountById(id: string, userId: string) {
    const account = await discordRepository.getAccountById(id, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    return account;
  }

  async createAccount(data: {
    userId: string;
    token: string;
    proxy?: string | null;
  }) {
    const info = await checkDiscordToken(data.token);

    return await discordRepository.createAccount({
      userId: data.userId,
      token: data.token,
      discordId: info.id,
      username: info.username,
      discriminator: info.discriminator,
      globalName: info.globalName,
      avatar: info.avatarUrl,
      banner: info.bannerUrl,
      accentColor: typeof info.accentColor === "number" ? `#${info.accentColor.toString(16).padStart(6, "0")}` : null,
      phone: info.phone,
      hasMfa: info.mfaEnabled,
      verified: info.verified ?? false,
      nitroType: info.nitroType,
      proxy: data.proxy || null,
      proxyStatus: data.proxy ? "unknown" : "unknown",
      status: "active",
    } as any);
  }

  async updateProxy(accountId: string, userId: string, proxy: string | null) {
    const account = await discordRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    return await discordRepository.updateAccount(accountId, userId, {
      proxy,
      proxyStatus: proxy ? "unknown" : "unknown",
    } as any);
  }

  async deleteAccount(accountId: string, userId: string) {
    const account = await discordRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    await discordRepository.deleteAccount(accountId, userId);
  }

  async getPresets(userId: string) {
    return await discordRepository.getPresets(userId);
  }

  async getPresetById(id: string, userId: string) {
    const preset = await discordRepository.getPresetById(id, userId);
    if (!preset) throw new Error("Không tìm thấy preset");
    return preset;
  }

  async createPreset(data: {
    userId: string;
    name: string;
    onlineStatus?: string;
    customStatusText?: string;
    customStatusEmoji?: string;
    customStatusExpiry?: string;
    activities?: any[];
  }) {
    return await discordRepository.createPreset({
      userId: data.userId,
      name: data.name,
      onlineStatus: data.onlineStatus || "online",
      customStatusText: data.customStatusText || null,
      customStatusEmoji: data.customStatusEmoji || null,
      customStatusExpiry: data.customStatusExpiry || null,
      activities: data.activities || [],
    } as any);
  }

  async updatePreset(
    id: string,
    userId: string,
    data: {
      name?: string;
      onlineStatus?: string;
      customStatusText?: string;
      customStatusEmoji?: string;
      customStatusExpiry?: string;
      activities?: any[];
    }
  ) {
    const preset = await discordRepository.getPresetById(id, userId);
    if (!preset) throw new Error("Không tìm thấy preset");
    return await discordRepository.updatePreset(id, userId, data as any);
  }

  async deletePreset(id: string, userId: string) {
    const preset = await discordRepository.getPresetById(id, userId);
    if (!preset) throw new Error("Không tìm thấy preset");
    await discordRepository.deletePreset(id, userId);
  }

  async getLogs(accountId: string, userId: string, params: {
    search?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    actionType?: string;
    status?: string;
  }) {
    const account = await discordRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    const result = await discordRepository.getLogs(accountId, params);
    return {
      resultCode: 0,
      message: "Success",
      data: result,
    };
  }

  async getLogsStats(accountId: string, userId: string) {
    const account = await discordRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    return await discordRepository.getLogsStats(accountId);
  }

  async clearLogs(accountId: string, userId: string) {
    const account = await discordRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    await discordRepository.clearLogs(accountId);
  }

  async refreshToken(accountId: string, userId: string) {
    const account = await discordRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    if (!account.token) throw new Error("Tài khoản không có token");

    const info = await checkDiscordToken(account.token);

    return await discordRepository.updateAccount(accountId, userId, {
      discordId: info.id,
      username: info.username,
      discriminator: info.discriminator,
      globalName: info.globalName,
      avatar: info.avatarUrl,
      banner: info.bannerUrl,
      accentColor: typeof info.accentColor === "number" ? `#${info.accentColor.toString(16).padStart(6, "0")}` : null,
      phone: info.phone,
      hasMfa: info.mfaEnabled,
      verified: info.verified ?? false,
      nitroType: info.nitroType,
    } as any);
  }

  async getCurrentPresence(accountId: string, userId: string) {
    const account = await discordRepository.getAccountById(accountId, userId);
    if (!account) throw new Error("Không tìm thấy tài khoản");
    if (!account.token) throw new Error("Tài khoản không có token");

    const info = await checkDiscordToken(account.token);

    return {
      status: info.settings?.status || "online",
      customStatus: info.settings?.customStatus || null,
      bio: info.bio || "",
      username: info.username,
      globalName: info.globalName,
      avatarUrl: info.avatarUrl,
    };
  }

  private static CALLBACK_SECRET = process.env.CALLBACK_SECRET || "vanistudio-discord-callback-2026";

  generateCallbackState(userId: string): { state: string; keyBase64: string } {
    const cryptoLib = require("crypto");
    const hmac = cryptoLib.createHmac("sha256", DiscordService.CALLBACK_SECRET);

    const key = cryptoLib.randomBytes(32);
    const keyBase64 = key.toString("base64");
    const expires = Date.now() + 180000; // 3 phút

    const payload = JSON.stringify({ u: userId, k: keyBase64, e: expires });
    const payloadB64 = Buffer.from(payload).toString("base64url");
    const sig = hmac.update(payloadB64).digest("base64url");

    const state = `${payloadB64}.${sig}`;
    return { state, keyBase64 };
  }

  private parseCallbackState(state: string): { userId: string; keyBase64: string } | null {
    try {
      const dotIdx = state.lastIndexOf(".");
      if (dotIdx === -1) return null;
      const payloadB64 = state.slice(0, dotIdx);
      const sig = state.slice(dotIdx + 1);

      const cryptoLib = require("crypto");
      const hmac = cryptoLib.createHmac("sha256", DiscordService.CALLBACK_SECRET);
      const expectedSig = hmac.update(payloadB64).digest("base64url");

      if (!cryptoLib.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));

      if (Date.now() > payload.e) return null;

      return { userId: payload.u, keyBase64: payload.k };
    } catch {
      return null;
    }
  }

  checkCallbackResult(state: string, userId: string) {
    const entry = this.parseCallbackState(state);
    if (!entry) return { status: "completed" as const };
    if (entry.userId !== userId) return { status: "invalid" as const };
    return { status: "waiting" as const };
  }

  async registerByCallbackRedirect(state: string, encryptedB64: string) {
    const entry = this.parseCallbackState(state);
    if (!entry) throw new Error("Phiên callback đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.");

    const keyBuffer = Buffer.from(entry.keyBase64, "base64");
    const combined = Buffer.from(encryptedB64, "base64");

    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(combined.length - 16);
    const ciphertext = combined.subarray(12, combined.length - 16);

    const { createDecipheriv } = await import("crypto");
    const decipher = createDecipheriv("aes-256-gcm", keyBuffer, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const token = decrypted.toString("utf-8");

    const info = await checkDiscordToken(token);

    const account = await discordRepository.createAccount({
      userId: entry.userId,
      token,
      discordId: info.id,
      username: info.username,
      discriminator: info.discriminator,
      globalName: info.globalName,
      avatar: info.avatarUrl,
      banner: info.bannerUrl,
      accentColor: typeof info.accentColor === "number" ? `#${info.accentColor.toString(16).padStart(6, "0")}` : null,
      phone: info.phone,
      hasMfa: info.mfaEnabled,
      verified: info.verified ?? false,
      nitroType: info.nitroType,
      proxy: null,
      proxyStatus: "unknown",
      status: "active",
    } as any);

    return {
      success: true,
      username: info.username,
      globalName: info.globalName || info.username,
      discordId: info.id,
      accountId: account.id,
    };
  }
}

export const discordService = new DiscordService();
