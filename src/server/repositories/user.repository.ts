import { db } from "@/server/configs/index.config";
import { users } from "@/schemas/user.schema";
import { eq, and, or, like, asc, desc, sql } from "drizzle-orm";

export const userRepository = {
  async getAll(options: {
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
      roleId: users.roleId,
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

    if (options.role) {
      conditions.push(eq(users.role, options.role));
    }

    const whereClause = conditions.length > 1
      ? and(...conditions.filter(Boolean) as any)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

    if (whereClause) query = query.where(whereClause);

    const sortColumn = options.sortBy === "email" ? users.email
      : options.sortBy === "role" ? users.role
      : options.sortBy === "username" ? users.username
      : users.createdAt;

    const sortDir = options.sortOrder === "asc" ? asc : desc;
    query = query.orderBy(sortDir(sortColumn));

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const total = Number(countResult?.count || 0);
    const data = await query.limit(limit).offset(offset);

    return { data, total };
  },

  async getById(id: string) {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return row || null;
  },

  async getByIdForMe(id: string) {
    const [row] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        avatarUrl: users.avatarUrl,
        provider: users.provider,
        role: users.role,
        roleId: users.roleId,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return row || null;
  },

  async getByEmail(email: string) {
    const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return row || null;
  },

  async getByUsername(username: string) {
    const [row] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return row || null;
  },

  async getByProvider(provider: "github" | "google" | "local", providerId: string) {
    const [row] = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
      .limit(1);
    return row || null;
  },

  async countAdminUsers() {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);
    return Number(row?.count || 0);
  },

  async create(data: any) {
    const [row] = await db.insert(users).values(data).returning();
    return row;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(users).where(eq(users.id, id)).returning();
    return row || null;
  },
};
