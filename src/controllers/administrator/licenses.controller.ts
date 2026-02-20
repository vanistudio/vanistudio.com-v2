import { db } from "@/configs/index.config";
import { licenses } from "@/schemas/license.schema";
import { users } from "@/schemas/user.schema";
import { products } from "@/schemas/product.schema";
import { eq, desc, like, or, and, sql } from "drizzle-orm";
import { randomBytes } from "crypto";

function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = 6;
  const segLen = 4;
  const parts: string[] = [];
  const bytes = randomBytes(segments * segLen);
  for (let s = 0; s < segments; s++) {
    let seg = "";
    for (let i = 0; i < segLen; i++) {
      seg += chars[bytes[s * segLen + i] % chars.length];
    }
    parts.push(seg);
  }
  return parts.join("-");
}

export const licensesController = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];

    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(or(like(licenses.key, search), like(licenses.productName, search)));
    }

    if (options.status && ["active", "expired", "revoked", "unused"].includes(options.status)) {
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

    return {
      licenses: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
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

    if (!license) throw new Error("Không tìm thấy license");
    return license;
  },

  async create(data: {
    productId?: string;
    productName: string;
    userId?: string;
    status?: string;

    notes?: string;
    domain?: string;
    expiresAt?: string;
  }): Promise<any> {
    const key = generateLicenseKey();

    const [existing] = await db.select({ id: licenses.id }).from(licenses).where(eq(licenses.key, key)).limit(1);
    if (existing) return this.create(data);

    const [license] = await db.insert(licenses).values({
      key,
      productId: data.productId || null,
      productName: data.productName,
      userId: (data.userId && data.userId !== "none") ? data.userId : null,
      status: (data.status as any) || ((data.userId && data.userId !== "none") ? "active" : "unused"),

      notes: data.notes || null,
      domain: data.domain || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      activatedAt: data.userId ? new Date() : null,
    }).returning();

    return license;
  },

  async update(id: string, data: Record<string, any>) {
    const { id: _, createdAt, key, ...updateData } = data;
    if (updateData.expiresAt) updateData.expiresAt = new Date(updateData.expiresAt);
    if (updateData.userId === "" || updateData.userId === "none") updateData.userId = null;

    const [updated] = await db.update(licenses)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(licenses.id, id))
      .returning();

    if (!updated) throw new Error("Không tìm thấy license");
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(licenses).where(eq(licenses.id, id)).returning();
    if (!deleted) throw new Error("Không tìm thấy license");
    return deleted;
  },

  async revoke(id: string) {
    const [updated] = await db.update(licenses)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(licenses.id, id))
      .returning();
    if (!updated) throw new Error("Không tìm thấy license");
    return updated;
  },

  async getProducts() {
    return db.select({ id: products.id, name: products.name }).from(products).orderBy(products.name);
  },

  async getUsers() {
    return db.select({ id: users.id, displayName: users.displayName, email: users.email })
      .from(users).orderBy(users.email);
  },
};
