import { db } from "@/server/db";
import {
  discordAccounts,
  discordPresencePresets,
  discordSelfbotLogs,
  type DiscordAccount,
  type DiscordPresencePreset,
  type DiscordSelfbotLog,
} from "@/server/db/schemas/discord-selfbot.schema";
import { eq, desc, and, asc, or, like, sql, count, inArray } from "drizzle-orm";

export class DiscordRepository {
  async getAccounts(userId: string): Promise<DiscordAccount[]> {
    return await db
      .select()
      .from(discordAccounts)
      .where(eq(discordAccounts.userId, userId))
      .orderBy(desc(discordAccounts.createdAt));
  }

  async getAccountsList(
    userId: string,
    params: {
      search?: string;
      page?: number;
      limit?: number;
      sortField?: string;
      sortOrder?: "asc" | "desc";
      status?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = eq(discordAccounts.userId, userId);
    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      whereClause = and(
        whereClause,
        or(
          like(discordAccounts.username, searchPattern),
          like(discordAccounts.globalName, searchPattern),
          like(discordAccounts.discordId, searchPattern)
        ) as any
      ) as any;
    }

    if (params.status) {
      whereClause = and(whereClause, eq(discordAccounts.status, params.status as any)) as any;
    }

    const sortField = params.sortField || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    let orderBySpec;
    if (sortField === "username") {
      orderBySpec = sortOrder === "desc" ? desc(discordAccounts.username) : asc(discordAccounts.username);
    } else {
      orderBySpec = sortOrder === "desc" ? desc(discordAccounts.createdAt) : asc(discordAccounts.createdAt);
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(discordAccounts)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const items = await db
      .select()
      .from(discordAccounts)
      .where(whereClause)
      .orderBy(orderBySpec)
      .limit(limit)
      .offset(offset);

    const [statsResult] = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when status = 'active' then 1 end)`,
        proxyActive: sql<number>`count(case when proxy_status = 'active' then 1 end)`,
      })
      .from(discordAccounts)
      .where(eq(discordAccounts.userId, userId));

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        total: Number(statsResult?.total || 0),
        active: Number(statsResult?.active || 0),
        proxyActive: Number(statsResult?.proxyActive || 0),
      },
    };
  }

  async getAccountById(id: string, userId: string): Promise<DiscordAccount | null> {
    const results = await db
      .select()
      .from(discordAccounts)
      .where(and(eq(discordAccounts.id, id), eq(discordAccounts.userId, userId)))
      .limit(1);
    return results[0] || null;
  }

  async createAccount(data: typeof discordAccounts.$inferInsert): Promise<DiscordAccount> {
    const [inserted] = await db.insert(discordAccounts).values(data).returning();
    if (!inserted) throw new Error("Tạo tài khoản Discord thất bại");
    return inserted;
  }

  async updateAccount(
    id: string,
    userId: string,
    data: Partial<Omit<DiscordAccount, "id" | "userId" | "createdAt">>
  ): Promise<DiscordAccount> {
    const [updated] = await db
      .update(discordAccounts)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(and(eq(discordAccounts.id, id), eq(discordAccounts.userId, userId)))
      .returning();
    if (!updated) throw new Error("Cập nhật tài khoản Discord thất bại");
    return updated;
  }

  async deleteAccount(id: string, userId: string): Promise<void> {
    await db
      .delete(discordAccounts)
      .where(and(eq(discordAccounts.id, id), eq(discordAccounts.userId, userId)));
  }

  // ==================== PRESETS ====================

  async getPresets(userId: string): Promise<DiscordPresencePreset[]> {
    return await db
      .select()
      .from(discordPresencePresets)
      .where(eq(discordPresencePresets.userId, userId))
      .orderBy(desc(discordPresencePresets.updatedAt));
  }

  async getPresetById(id: string, userId: string): Promise<DiscordPresencePreset | null> {
    const results = await db
      .select()
      .from(discordPresencePresets)
      .where(and(eq(discordPresencePresets.id, id), eq(discordPresencePresets.userId, userId)))
      .limit(1);
    return results[0] || null;
  }

  async createPreset(data: typeof discordPresencePresets.$inferInsert): Promise<DiscordPresencePreset> {
    const [inserted] = await db.insert(discordPresencePresets).values(data).returning();
    if (!inserted) throw new Error("Tạo preset thất bại");
    return inserted;
  }

  async updatePreset(
    id: string,
    userId: string,
    data: Partial<Omit<DiscordPresencePreset, "id" | "userId" | "createdAt">>
  ): Promise<DiscordPresencePreset> {
    const [updated] = await db
      .update(discordPresencePresets)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(and(eq(discordPresencePresets.id, id), eq(discordPresencePresets.userId, userId)))
      .returning();
    if (!updated) throw new Error("Cập nhật preset thất bại");
    return updated;
  }

  async deletePreset(id: string, userId: string): Promise<void> {
    await db
      .delete(discordPresencePresets)
      .where(and(eq(discordPresencePresets.id, id), eq(discordPresencePresets.userId, userId)));
  }
  async getLogs(
    accountId: string,
    params: {
      search?: string;
      page?: number;
      limit?: number;
      sortField?: string;
      sortOrder?: "asc" | "desc";
      actionType?: string;
      status?: string;
    }
  ) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = eq(discordSelfbotLogs.accountId, accountId);

    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      whereClause = and(whereClause, like(discordSelfbotLogs.message, searchPattern)) as any;
    }

    if (params.actionType && params.actionType !== "all") {
      whereClause = and(whereClause, eq(discordSelfbotLogs.actionType, params.actionType as any)) as any;
    }

    if (params.status && params.status !== "all") {
      whereClause = and(whereClause, eq(discordSelfbotLogs.status, params.status as any)) as any;
    }

    const sortOrder = params.sortOrder || "desc";
    const orderBySpec = sortOrder === "desc"
      ? desc(discordSelfbotLogs.createdAt)
      : asc(discordSelfbotLogs.createdAt);

    const [countResult] = await db
      .select({ count: count() })
      .from(discordSelfbotLogs)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const items = await db
      .select()
      .from(discordSelfbotLogs)
      .where(whereClause)
      .orderBy(orderBySpec)
      .limit(limit)
      .offset(offset);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  async getLogsStats(accountId: string) {
    const [statsResult] = await db
      .select({
        auto: sql<number>`count(case when action_type in ('auto_reply', 'trigger_fired') then 1 end)`,
        profile: sql<number>`count(case when action_type in ('rpc_update', 'change_avatar', 'change_bio') then 1 end)`,
        errors: sql<number>`count(case when status in ('failed', 'warning') then 1 end)`,
        total: sql<number>`count(*)`,
      })
      .from(discordSelfbotLogs)
      .where(eq(discordSelfbotLogs.accountId, accountId));

    return {
      auto: Number(statsResult?.auto || 0),
      profile: Number(statsResult?.profile || 0),
      errors: Number(statsResult?.errors || 0),
      total: Number(statsResult?.total || 0),
    };
  }

  async createLog(data: typeof discordSelfbotLogs.$inferInsert): Promise<DiscordSelfbotLog> {
    const [inserted] = await db.insert(discordSelfbotLogs).values(data).returning();
    if (!inserted) throw new Error("Tạo log thất bại");
    return inserted;
  }

  async clearLogs(accountId: string): Promise<void> {
    await db.delete(discordSelfbotLogs).where(eq(discordSelfbotLogs.accountId, accountId));
  }
}

export const discordRepository = new DiscordRepository();
