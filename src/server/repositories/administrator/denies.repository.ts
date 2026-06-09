import { db } from "@/server/db";
import { denies, type Deny, type NewDeny } from "@/server/db/schemas/deny.schema";
import { eq, like, or, and, sql, desc, asc, count } from "drizzle-orm";

export interface GetDeniesParams {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export class DeniesRepository {
  async getDeniesList(params: GetDeniesParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      whereClause = or(
        like(denies.ip, searchPattern),
        like(denies.reason, searchPattern),
        like(denies.whoBanned, searchPattern)
      );
    }

    const sortField = params.sortField || "createdAt";
    const sortOrder = params.sortOrder || "desc";
    
    let orderBySpec;
    if (sortField === "expiresAt") {
      orderBySpec = sortOrder === "desc" ? desc(denies.expiresAt) : asc(denies.expiresAt);
    } else if (sortField === "ip") {
      orderBySpec = sortOrder === "desc" ? desc(denies.ip) : asc(denies.ip);
    } else if (sortField === "reason") {
      orderBySpec = sortOrder === "desc" ? desc(denies.reason) : asc(denies.reason);
    } else if (sortField === "whoBanned") {
      orderBySpec = sortOrder === "desc" ? desc(denies.whoBanned) : asc(denies.whoBanned);
    } else {
      orderBySpec = sortOrder === "desc" ? desc(denies.createdAt) : asc(denies.createdAt);
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(denies)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const items = await db
      .select()
      .from(denies)
      .where(whereClause)
      .orderBy(orderBySpec)
      .limit(limit)
      .offset(offset);

    const [statsResult] = await db
      .select({
        totalBanned: sql<number>`count(*)`,
        activeBanned: sql<number>`count(case when expires_at is null or expires_at > now() then 1 end)`,
        tempBanned: sql<number>`count(case when expires_at is not null and expires_at > now() then 1 end)`,
      })
      .from(denies);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        totalBanned: Number(statsResult?.totalBanned || 0),
        activeBanned: Number(statsResult?.activeBanned || 0),
        tempBanned: Number(statsResult?.tempBanned || 0),
      },
    };
  }

  async findById(id: string) {
    const [item] = await db.select().from(denies).where(eq(denies.id, id));
    return item || null;
  }

  async findByIp(ip: string) {
    const [item] = await db.select().from(denies).where(eq(denies.ip, ip));
    return item || null;
  }

  async createDeny(data: Omit<NewDeny, "id" | "createdAt" | "updatedAt">) {
    const [inserted] = await db
      .insert(denies)
      .values(data)
      .returning();
    return inserted;
  }

  async updateDeny(id: string, data: Partial<Omit<NewDeny, "id" | "createdAt" | "updatedAt">>) {
    const [updated] = await db
      .update(denies)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(denies.id, id))
      .returning();
    return updated;
  }

  async deleteDeny(id: string) {
    const [deleted] = await db
      .delete(denies)
      .where(eq(denies.id, id))
      .returning();
    return deleted;
  }
}

export const deniesRepository = new DeniesRepository();
