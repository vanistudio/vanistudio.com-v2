import { licensesRepository } from "@/server/repositories/licenses.repository";
import { productsRepository } from "@/server/repositories/products.repository";
import { db } from "@/server/db";
import { users } from "@/server/db/schemas/user.schema";
import { asc, like, or } from "drizzle-orm";

export class LicensesService {
  async getLicensesList(params: any) {
    const result = await licensesRepository.getLicensesList(params);
    return {
      resultCode: 0,
      message: "Success",
      data: {
        items: result.items,
        stats: result.stats,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  async getLicenseById(id: string) {
    return await licensesRepository.getLicenseById(id);
  }

  async createLicense(data: {
    userId: string;
    productId: string;
    licenseKey: string;
    status: string;
    allowedDomains: string[];
    allowedIps: string[];
    maxActivations: number;
    expiresAt?: Date | null;
  }) {
    if (!data.userId) throw new Error("Chưa chọn người sở hữu bản quyền");
    if (!data.productId) throw new Error("Chưa chọn sản phẩm");
    if (!data.licenseKey?.trim()) throw new Error("Mã bản quyền không được để trống");

    const existing = await licensesRepository.getLicenseByKey(data.licenseKey);
    if (existing) throw new Error("Mã bản quyền này đã tồn tại trên hệ thống");

    return await licensesRepository.createLicense({
      ...data,
      activationCount: 0,
      activatedAt: null,
    });
  }

  async updateLicense(
    id: string,
    data: {
      status?: string;
      allowedDomains?: string[];
      allowedIps?: string[];
      maxActivations?: number;
      expiresAt?: Date | null;
    }
  ) {
    const existing = await licensesRepository.getLicenseById(id);
    if (!existing) throw new Error("Không tìm thấy bản quyền cần cập nhật");

    return await licensesRepository.updateLicense(id, data);
  }

  async deleteLicense(id: string) {
    const existing = await licensesRepository.getLicenseById(id);
    if (!existing) throw new Error("Không tìm thấy bản quyền cần xóa");
    await licensesRepository.deleteLicense(id);
  }

  async getActiveProducts() {
    const list = await productsRepository.getProducts();
    return list.filter((p) => p.status === "active");
  }

  async searchUsers(query: string) {
    let whereClause = undefined;
    if (query && query.trim()) {
      const searchPattern = `%${query.trim()}%`;
      whereClause = or(
        like(users.name, searchPattern),
        like(users.email, searchPattern)
      );
    }
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(whereClause)
      .orderBy(asc(users.name))
      .limit(30);
  }
}

export const licensesService = new LicensesService();
