import { db } from "@/server/db";
import { licenses } from "@/server/db/schemas/license.schema";
import { users } from "@/server/db/schemas/user.schema";
import { products } from "@/server/db/schemas/product.schema";
import { eq, desc, asc, or, like, sql, count } from "drizzle-orm";

export interface GetLicensesParams {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  productId?: string;
  all?: boolean;
}

export class LicensesRepository {
  async getLicenses() {
    return await db
      .select({
        id: licenses.id,
        userId: licenses.userId,
        productId: licenses.productId,
        licenseKey: licenses.licenseKey,
        status: licenses.status,
        allowedDomains: licenses.allowedDomains,
        allowedIps: licenses.allowedIps,
        maxActivations: licenses.maxActivations,
        activationCount: licenses.activationCount,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        updatedAt: licenses.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        product: {
          id: products.id,
          name: products.name,
        },
      })
      .from(licenses)
      .innerJoin(users, eq(licenses.userId, users.id))
      .innerJoin(products, eq(licenses.productId, products.id))
      .orderBy(desc(licenses.createdAt));
  }

  async getLicensesList(params: GetLicensesParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      conditions.push(
        or(
          like(licenses.licenseKey, searchPattern),
          like(users.name, searchPattern),
          like(users.email, searchPattern),
          like(products.name, searchPattern)
        )
      );
    }

    if (params.status && params.status !== "all") {
      conditions.push(eq(licenses.status, params.status));
    }

    if (params.productId && params.productId !== "all") {
      conditions.push(eq(licenses.productId, params.productId));
    }

    const whereClause = conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined;

    const sortField = params.sortField || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    let orderBySpec;
    if (sortField === "licenseKey") {
      orderBySpec = sortOrder === "desc" ? desc(licenses.licenseKey) : asc(licenses.licenseKey);
    } else if (sortField === "status") {
      orderBySpec = sortOrder === "desc" ? desc(licenses.status) : asc(licenses.status);
    } else if (sortField === "activationCount") {
      orderBySpec = sortOrder === "desc" ? desc(licenses.activationCount) : asc(licenses.activationCount);
    } else {
      orderBySpec = sortOrder === "desc" ? desc(licenses.createdAt) : asc(licenses.createdAt);
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(licenses)
      .innerJoin(users, eq(licenses.userId, users.id))
      .innerJoin(products, eq(licenses.productId, products.id))
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    const baseQuery = db
      .select({
        id: licenses.id,
        userId: licenses.userId,
        productId: licenses.productId,
        licenseKey: licenses.licenseKey,
        status: licenses.status,
        allowedDomains: licenses.allowedDomains,
        allowedIps: licenses.allowedIps,
        maxActivations: licenses.maxActivations,
        activationCount: licenses.activationCount,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        updatedAt: licenses.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        product: {
          id: products.id,
          name: products.name,
        },
      })
      .from(licenses)
      .innerJoin(users, eq(licenses.userId, users.id))
      .innerJoin(products, eq(licenses.productId, products.id))
      .where(whereClause)
      .orderBy(orderBySpec);

    let items;
    if (params.all) {
      items = await baseQuery;
    } else {
      items = await baseQuery.limit(limit).offset(offset);
    }

    const [statsResult] = await db
      .select({
        totalLicenses: sql<number>`count(*)`,
        activatedLicenses: sql<number>`count(case when status = 'activated' then 1 end)`,
        notActivatedLicenses: sql<number>`count(case when status = 'not_activated' then 1 end)`,
        expiredLicenses: sql<number>`count(case when status = 'expired' then 1 end)`,
        suspendedLicenses: sql<number>`count(case when status = 'suspended' then 1 end)`,
      })
      .from(licenses);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        totalLicenses: Number(statsResult?.totalLicenses || 0),
        activatedLicenses: Number(statsResult?.activatedLicenses || 0),
        notActivatedLicenses: Number(statsResult?.notActivatedLicenses || 0),
        expiredLicenses: Number(statsResult?.expiredLicenses || 0),
        suspendedLicenses: Number(statsResult?.suspendedLicenses || 0),
      },
    };
  }

  async getLicenseById(id: string) {
    const results = await db
      .select({
        id: licenses.id,
        userId: licenses.userId,
        productId: licenses.productId,
        licenseKey: licenses.licenseKey,
        status: licenses.status,
        allowedDomains: licenses.allowedDomains,
        allowedIps: licenses.allowedIps,
        maxActivations: licenses.maxActivations,
        activationCount: licenses.activationCount,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        updatedAt: licenses.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        product: {
          id: products.id,
          name: products.name,
        },
      })
      .from(licenses)
      .innerJoin(users, eq(licenses.userId, users.id))
      .innerJoin(products, eq(licenses.productId, products.id))
      .where(eq(licenses.id, id));

    return results[0] || null;
  }

  async getLicenseByKey(key: string) {
    const results = await db
      .select({
        id: licenses.id,
        userId: licenses.userId,
        productId: licenses.productId,
        licenseKey: licenses.licenseKey,
        status: licenses.status,
        allowedDomains: licenses.allowedDomains,
        allowedIps: licenses.allowedIps,
        maxActivations: licenses.maxActivations,
        activationCount: licenses.activationCount,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        updatedAt: licenses.updatedAt,
      })
      .from(licenses)
      .where(eq(licenses.licenseKey, key));

    return results[0] || null;
  }

  async createLicense(data: any) {
    const [inserted] = await db.insert(licenses).values(data).returning();
    if (!inserted) throw new Error("Tạo bản quyền thất bại");
    return inserted;
  }

  async updateLicense(id: string, data: any) {
    const [updated] = await db
      .update(licenses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(licenses.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật bản quyền thất bại");
    return updated;
  }

  async deleteLicense(id: string) {
    await db.delete(licenses).where(eq(licenses.id, id));
  }
}

export const licensesRepository = new LicensesRepository();
