import { db } from "@/server/db";
import {
  telegramAccounts,
  telegramAutoResponders,
  telegramSelfbotLogs,
  type TelegramAccount,
  type NewTelegramAccount,
  type TelegramAutoResponder,
  type NewTelegramAutoResponder,
  type TelegramSelfbotLog,
  type NewTelegramSelfbotLog,
} from "@/server/db/schemas/telegram-selfbot.schema";
import { eq, desc, and, asc, or, like, sql, count } from "drizzle-orm";

export class TelegramRepository {
  // Accounts
  async getAccounts(userId: string): Promise<TelegramAccount[]> {
    return await db
      .select()
      .from(telegramAccounts)
      .where(eq(telegramAccounts.userId, userId))
      .orderBy(desc(telegramAccounts.createdAt));
  }

  async getAccountsList(userId: string, params: {
    search?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = eq(telegramAccounts.userId, userId);
    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      whereClause = and(
        whereClause,
        or(
          like(telegramAccounts.phone, searchPattern),
          like(telegramAccounts.username, searchPattern),
          like(telegramAccounts.firstName, searchPattern),
          like(telegramAccounts.lastName, searchPattern)
        ) as any
      ) as any;
    }

    if (params.status) {
      whereClause = and(whereClause, eq(telegramAccounts.status, params.status as any)) as any;
    }

    const sortField = params.sortField || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    let orderBySpec;
    if (sortField === "phone") {
      orderBySpec = sortOrder === "desc" ? desc(telegramAccounts.phone) : asc(telegramAccounts.phone);
    } else if (sortField === "username") {
      orderBySpec = sortOrder === "desc" ? desc(telegramAccounts.username) : asc(telegramAccounts.username);
    } else {
      orderBySpec = sortOrder === "desc" ? desc(telegramAccounts.createdAt) : asc(telegramAccounts.createdAt);
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(telegramAccounts)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const items = await db
      .select()
      .from(telegramAccounts)
      .where(whereClause)
      .orderBy(orderBySpec)
      .limit(limit)
      .offset(offset);

    const [statsResult] = await db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when status = 'active' then 1 end)`,
        inactive: sql<number>`count(case when status = 'inactive' then 1 end)`,
      })
      .from(telegramAccounts)
      .where(eq(telegramAccounts.userId, userId));

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        total: Number(statsResult?.total || 0),
        active: Number(statsResult?.active || 0),
        inactive: Number(statsResult?.inactive || 0),
      },
    };
  }

  async getAccountById(id: string, userId: string): Promise<TelegramAccount | null> {
    const results = await db
      .select()
      .from(telegramAccounts)
      .where(
        and(
          eq(telegramAccounts.id, id),
          eq(telegramAccounts.userId, userId)
        )
      )
      .limit(1);
    return results[0] || null;
  }

  async getAccountByPhone(phone: string, userId: string): Promise<TelegramAccount | null> {
    const results = await db
      .select()
      .from(telegramAccounts)
      .where(
        and(
          eq(telegramAccounts.phone, phone),
          eq(telegramAccounts.userId, userId)
        )
      )
      .limit(1);
    return results[0] || null;
  }

  async createAccount(data: NewTelegramAccount): Promise<TelegramAccount> {
    const [inserted] = await db.insert(telegramAccounts).values(data).returning();
    if (!inserted) throw new Error("Tạo tài khoản Telegram thất bại");
    return inserted;
  }

  async updateAccount(id: string, userId: string, data: Partial<Omit<TelegramAccount, "id" | "userId" | "createdAt">>): Promise<TelegramAccount> {
    const [updated] = await db
      .update(telegramAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(telegramAccounts.id, id),
          eq(telegramAccounts.userId, userId)
        )
      )
      .returning();
    if (!updated) throw new Error("Cập nhật tài khoản Telegram thất bại");
    return updated;
  }

  async deleteAccount(id: string, userId: string): Promise<void> {
    await db
      .delete(telegramAccounts)
      .where(
        and(
          eq(telegramAccounts.id, id),
          eq(telegramAccounts.userId, userId)
        )
      );
  }

  // Auto Responders
  async getAutoResponder(accountId: string): Promise<TelegramAutoResponder | null> {
    const results = await db
      .select()
      .from(telegramAutoResponders)
      .where(eq(telegramAutoResponders.accountId, accountId))
      .limit(1);
    return results[0] || null;
  }

  async createAutoResponder(data: NewTelegramAutoResponder): Promise<TelegramAutoResponder> {
    const [inserted] = await db.insert(telegramAutoResponders).values(data).returning();
    if (!inserted) throw new Error("Tạo cấu hình phản hồi tự động thất bại");
    return inserted;
  }

  async updateAutoResponder(id: string, data: Partial<Omit<TelegramAutoResponder, "id" | "accountId" | "createdAt">>): Promise<TelegramAutoResponder> {
    const [updated] = await db
      .update(telegramAutoResponders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(telegramAutoResponders.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật cấu hình phản hồi tự động thất bại");
    return updated;
  }

  async updateAutoResponderByAccountId(accountId: string, data: Partial<Omit<TelegramAutoResponder, "id" | "accountId" | "createdAt">>): Promise<TelegramAutoResponder> {
    const [updated] = await db
      .update(telegramAutoResponders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(telegramAutoResponders.accountId, accountId))
      .returning();
    if (!updated) throw new Error("Cập nhật cấu hình phản hồi tự động thất bại");
    return updated;
  }

  // Logs
  async getLogs(accountId: string, limitVal = 100): Promise<TelegramSelfbotLog[]> {
    return await db
      .select()
      .from(telegramSelfbotLogs)
      .where(eq(telegramSelfbotLogs.accountId, accountId))
      .orderBy(desc(telegramSelfbotLogs.createdAt))
      .limit(limitVal);
  }

  async getLogsList(accountId: string, params: {
    search?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    event?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = eq(telegramSelfbotLogs.accountId, accountId);
    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      whereClause = and(
        whereClause,
        like(telegramSelfbotLogs.message, searchPattern)
      ) as any;
    }

    if (params.event && params.event !== "all") {
      whereClause = and(whereClause, eq(telegramSelfbotLogs.actionType, params.event as any)) as any;
    }

    const sortField = params.sortField || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    let orderBySpec = sortOrder === "desc"
      ? desc(telegramSelfbotLogs.createdAt)
      : asc(telegramSelfbotLogs.createdAt);

    const [countResult] = await db
      .select({ count: count() })
      .from(telegramSelfbotLogs)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const items = await db
      .select()
      .from(telegramSelfbotLogs)
      .where(whereClause)
      .orderBy(orderBySpec)
      .limit(limit)
      .offset(offset);

    const [statsResult] = await db
      .select({
        total: sql<number>`count(*)`,
        autoReply: sql<number>`count(case when action_type = 'auto_reply' then 1 end)`,
        connection: sql<number>`count(case when action_type = 'connection' then 1 end)`,
      })
      .from(telegramSelfbotLogs)
      .where(eq(telegramSelfbotLogs.accountId, accountId));

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        total: Number(statsResult?.total || 0),
        autoReply: Number(statsResult?.autoReply || 0),
        connection: Number(statsResult?.connection || 0),
      },
    };
  }

  async createLog(data: NewTelegramSelfbotLog): Promise<TelegramSelfbotLog> {
    const [inserted] = await db.insert(telegramSelfbotLogs).values(data).returning();
    if (!inserted) throw new Error("Tạo lịch sử hoạt động thất bại");
    return inserted;
  }

  async clearLogs(accountId: string): Promise<void> {
    await db.delete(telegramSelfbotLogs).where(eq(telegramSelfbotLogs.accountId, accountId));
  }
}

export const telegramRepository = new TelegramRepository();
