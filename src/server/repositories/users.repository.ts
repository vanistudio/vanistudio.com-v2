import { db } from "@/server/db";
import { users, userProfile, userSession, provider, type User, type NewUser, type UserProfile, type NewUserProfile } from "@/server/db/schemas/user.schema";
import { eq, like, or, and, sql, desc, asc, count } from "drizzle-orm";

export interface GetUsersParams {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  role?: string;
}

export class UsersRepository {
  async getUsersList(params: GetUsersParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    const conditions = [];

    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      conditions.push(
        or(
          like(users.name, searchPattern),
          like(users.username, searchPattern),
          like(users.email, searchPattern),
          like(users.banReason, searchPattern)
        )
      );
    }

    if (params.role && params.role !== "all") {
      conditions.push(eq(users.role, params.role));
    }

    if (conditions.length > 0) {
      whereClause = and(...conditions);
    }

    const sortField = params.sortField || "createdAt";
    const sortOrder = params.sortOrder || "desc";
    
    let orderBySpec;
    if (sortField === "name") {
      orderBySpec = sortOrder === "desc" ? desc(users.name) : asc(users.name);
    } else if (sortField === "email") {
      orderBySpec = sortOrder === "desc" ? desc(users.email) : asc(users.email);
    } else if (sortField === "role") {
      orderBySpec = sortOrder === "desc" ? desc(users.role) : asc(users.role);
    } else if (sortField === "banned") {
      orderBySpec = sortOrder === "desc" ? desc(users.banned) : asc(users.banned);
    } else {
      orderBySpec = sortOrder === "desc" ? desc(users.createdAt) : asc(users.createdAt);
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const items = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderBySpec)
      .limit(limit)
      .offset(offset);

    const [statsResult] = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        activeUsers: sql<number>`count(case when banned = false then 1 end)`,
        admins: sql<number>`count(case when role = 'admin' then 1 end)`,
      })
      .from(users);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        totalUsers: Number(statsResult?.totalUsers || 0),
        activeUsers: Number(statsResult?.activeUsers || 0),
        admins: Number(statsResult?.admins || 0),
      },
    };
  }

  async findById(id: string) {
    const [item] = await db.select().from(users).where(eq(users.id, id));
    return item || null;
  }

  async findByEmail(email: string) {
    const [item] = await db.select().from(users).where(eq(users.email, email));
    return item || null;
  }

  async updateUser(id: string, data: Partial<Omit<NewUser, "id" | "createdAt" | "updatedAt">>) {
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deleted;
  }

  async getUserFullDetails(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return null;

    const [profile] = await db.select().from(userProfile).where(eq(userProfile.userId, id));
    const sessions = await db.select().from(userSession).where(eq(userSession.userId, id)).orderBy(desc(userSession.createdAt));
    const providers = await db.select().from(provider).where(eq(provider.userId, id)).orderBy(desc(provider.createdAt));

    return {
      user,
      profile: profile || null,
      sessions,
      providers,
    };
  }

  async updateUserFullDetails(
    id: string,
    userData: Partial<Omit<NewUser, "id" | "createdAt" | "updatedAt">>,
    profileData: Partial<Omit<NewUserProfile, "userId" | "createdAt" | "updatedAt">>
  ) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    const [existingProfile] = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.userId, id));

    let updatedProfile;
    if (existingProfile) {
      [updatedProfile] = await db
        .update(userProfile)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, id))
        .returning();
    } else {
      [updatedProfile] = await db
        .insert(userProfile)
        .values({
          userId: id,
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    return {
      user: updatedUser,
      profile: updatedProfile,
    };
  }

  async revokeSession(sessionId: string, userId: string) {
    const [deleted] = await db
      .delete(userSession)
      .where(and(eq(userSession.id, sessionId), eq(userSession.userId, userId)))
      .returning();
    return deleted || null;
  }
}

export const usersRepository = new UsersRepository();
