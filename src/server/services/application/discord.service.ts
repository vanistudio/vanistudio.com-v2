import { discordRepository } from "@/server/repositories/discord.repository";

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
    return await discordRepository.createAccount({
      userId: data.userId,
      token: data.token,
      proxy: data.proxy || null,
      proxyStatus: data.proxy ? "unknown" : "unknown",
      status: "active",
      nitroType: "None",
      badges: [],
      connections: [],
      guildsCount: 0,
      isRunning: false,
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
}

export const discordService = new DiscordService();
