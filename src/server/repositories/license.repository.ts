import { db } from "@/server/configs/index.config";
import { licenses } from "@/schemas/license.schema";
import { users } from "@/schemas/user.schema";
import { products } from "@/schemas/product.schema";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export const licenseRepository = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    scopeUserId?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.scopeUserId) {
      conditions.push(eq(licenses.userId, options.scopeUserId));
    }

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(or(like(licenses.key, search), like(licenses.productName, search)));
    }

    if (options.status) {
      conditions.push(eq(licenses.status, options.status as any));
    }

    const whereClause = conditions.length > 1
      ? and(...conditions.filter(Boolean) as any)
      : conditions.length === 1
        ? conditions[0]
        : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(licenses)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    const data = await db
      .select({
        id: licenses.id,
        key: licenses.key,
        productId: licenses.productId,
        productName: licenses.productName,
        userId: licenses.userId,
        status: licenses.status,
        notes: licenses.notes,
        domain: licenses.domain,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        updatedAt: licenses.updatedAt,
        userName: users.displayName,
        userEmail: users.email,
      })
      .from(licenses)
      .leftJoin(users, eq(licenses.userId, users.id))
      .where(whereClause)
      .orderBy(desc(licenses.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  },

  async getById(id: string) {
    const [license] = await db
      .select({
        id: licenses.id,
        key: licenses.key,
        productId: licenses.productId,
        productName: licenses.productName,
        userId: licenses.userId,
        status: licenses.status,
        notes: licenses.notes,
        domain: licenses.domain,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        updatedAt: licenses.updatedAt,
        userName: users.displayName,
        userEmail: users.email,
      })
      .from(licenses)
      .leftJoin(users, eq(licenses.userId, users.id))
      .where(eq(licenses.id, id))
      .limit(1);

    return license || null;
  },

  async getByKey(key: string) {
    const [row] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1);
    return row || null;
  },

  async getByDomain(domain: string) {
    const [row] = await db.select({
      productName: licenses.productName,
      status: licenses.status,
      domain: licenses.domain,
      expiresAt: licenses.expiresAt,
      activatedAt: licenses.activatedAt,
      createdAt: licenses.createdAt,
      ownerName: users.fullName,
    }).from(licenses)
      .leftJoin(users, eq(licenses.userId, users.id))
      .where(eq(licenses.domain, domain))
      .limit(1);
    return row || null;
  },

  async create(data: any) {
    const [row] = await db.insert(licenses).values(data).returning();
    return row;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(licenses).set(data).where(eq(licenses.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(licenses).where(eq(licenses.id, id)).returning();
    return row || null;
  },

  async getProducts() {
    return db.select({ id: products.id, name: products.name }).from(products).orderBy(products.name);
  },

  async getUsers() {
    return db.select({ id: users.id, displayName: users.displayName, email: users.email })
      .from(users).orderBy(users.email);
  },
};
