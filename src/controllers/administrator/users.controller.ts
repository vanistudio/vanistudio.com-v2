import { db } from "@/configs/index.config";
import { users } from "@/schemas/user.schema";
import { eq, desc, asc, like, or, sql } from "drizzle-orm";

export const usersController = {
  async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    let query = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      displayName: users.displayName,
      fullName: users.fullName,
      phoneNumber: users.phoneNumber,
      avatarUrl: users.avatarUrl,
      provider: users.provider,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).$dynamic();

    const conditions = [];

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(
        or(
          like(users.username, search),
          like(users.email, search),
          like(users.fullName, search),
          like(users.displayName, search),
        )
      );
    }

    if (options.role && (options.role === "admin" || options.role === "user")) {
      conditions.push(eq(users.role, options.role));
    }

    if (conditions.length > 0) {
      for (const condition of conditions) {
        if (condition) query = query.where(condition);
      }
    }

    const sortColumn = options.sortBy === "email" ? users.email
      : options.sortBy === "role" ? users.role
      : options.sortBy === "username" ? users.username
      : users.createdAt;

    const sortDir = options.sortOrder === "asc" ? asc : desc;
    query = query.orderBy(sortDir(sortColumn));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(conditions.length > 0 ? conditions[0] : undefined);

    const total = Number(countResult?.count || 0);
    const data = await query.limit(limit).offset(offset);

    return {
      users: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async toggleActive(userId: string) {
    const [user] = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const [updated] = await db
      .update(users)
      .set({ isActive: !user.isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return updated;
  },

  async updateRole(userId: string, role: "admin" | "user") {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) throw new Error("Không tìm thấy người dùng");
    return updated;
  },

  async deleteUser(userId: string) {
    const [deleted] = await db.delete(users).where(eq(users.id, userId)).returning();
    if (!deleted) throw new Error("Không tìm thấy người dùng");
    return deleted;
  },
};