import { licenseRepository } from "@/server/repositories/license.repository";
import { randomBytes, createHmac } from "crypto";

const LICENSE_SECRET = process.env.APP_LICENSE_SECRET || "123";

function generateSignature(key: string, domain: string, timestamp: number): string {
  return createHmac("sha256", LICENSE_SECRET)
    .update(`${key}:${domain}:${timestamp}`)
    .digest("hex");
}

function cleanDomainInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/)?/, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0]
    .replace(/\/+$/, "")
    .trim();
}

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function getCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: any, ttl = CACHE_TTL) {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

function invalidateCache(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

// Clean cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now > entry.expiry) cache.delete(key);
  }
}, 5 * 60 * 1000);

function generateLicenseKeyString(): string {
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

export const licenseService = {
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    scopeUserId?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const { data, total } = await licenseRepository.getAll(options);

    return {
      licenses: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string, scopeUserId?: string) {
    const license = await licenseRepository.getById(id);
    if (!license) throw new Error("Không tìm thấy license");
    if (scopeUserId && license.userId !== scopeUserId) throw new Error("Bạn không có quyền truy cập license này");
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
  }, _retries = 0): Promise<any> {
    if (_retries > 5) throw new Error("Không thể tạo license key duy nhất, vui lòng thử lại");
    const key = generateLicenseKeyString();

    const existing = await licenseRepository.getByKey(key);
    if (existing) return this.create(data, _retries + 1);

    return licenseRepository.create({
      key,
      productId: data.productId || null,
      productName: data.productName,
      userId: (data.userId && data.userId !== "none") ? data.userId : null,
      status: (data.status as any) || ((data.userId && data.userId !== "none") ? "active" : "unused"),
      notes: data.notes || null,
      domain: data.domain || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      activatedAt: data.userId ? new Date() : null,
    });
  },

  async update(id: string, data: Record<string, any>, scopeUserId?: string) {
    if (scopeUserId) {
      const existing = await licenseRepository.getById(id);
      if (!existing) throw new Error("Không tìm thấy license");
      if (existing.userId !== scopeUserId) throw new Error("Bạn không có quyền chỉnh sửa license này");
    }
    const { id: _, createdAt, key, ...updateData } = data;
    if (updateData.expiresAt) updateData.expiresAt = new Date(updateData.expiresAt);
    if (updateData.userId === "" || updateData.userId === "none") updateData.userId = null;

    const updated = await licenseRepository.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updated) throw new Error("Không tìm thấy license");
    return updated;
  },

  async delete(id: string, scopeUserId?: string) {
    if (scopeUserId) {
      const existing = await licenseRepository.getById(id);
      if (!existing) throw new Error("Không tìm thấy license");
      if (existing.userId !== scopeUserId) throw new Error("Bạn không có quyền xóa license này");
    }
    const deleted = await licenseRepository.delete(id);
    if (!deleted) throw new Error("Không tìm thấy license");
    return deleted;
  },

  async revoke(id: string, scopeUserId?: string) {
    if (scopeUserId) {
      const existing = await licenseRepository.getById(id);
      if (!existing) throw new Error("Không tìm thấy license");
      if (existing.userId !== scopeUserId) throw new Error("Bạn không có quyền thu hồi license này");
    }
    const updated = await licenseRepository.update(id, {
      status: "revoked",
      updatedAt: new Date(),
    });
    if (!updated) throw new Error("Không tìm thấy license");
    return updated;
  },

  async getProducts() {
    return licenseRepository.getProducts();
  },

  async getUsers() {
    return licenseRepository.getUsers();
  },

  async verifyDomain(rawDomain: string) {
    const domain = cleanDomainInput(rawDomain);
    if (!domain) throw new Error("Vui lòng nhập tên miền hợp lệ");

    const cacheKey = `verify:${domain}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const license = await licenseRepository.getByDomain(domain);

    if (!license) {
      const result = { success: false, error: "Tên miền này chưa được cấp giấy phép hoạt động" };
      setCache(cacheKey, result, 2 * 60 * 1000);
      return result;
    }

    const isActive = license.status === "active";
    const isExpired = license.expiresAt ? new Date(license.expiresAt) < new Date() : false;

    const result = {
      success: true,
      verified: isActive && !isExpired,
      license: {
        productName: license.productName,
        status: isExpired ? "expired" : license.status,
        domain: license.domain,
        ownerName: license.ownerName || null,
        expiresAt: license.expiresAt,
        activatedAt: license.activatedAt,
        createdAt: license.createdAt,
      },
    };

    setCache(cacheKey, result);
    return result;
  },

  async activateLicense(body: { key: string; domain: string; timestamp?: number; signature?: string }) {
    const { key, domain, timestamp, signature } = body;

    if (!key || !domain) {
      return { valid: false, code: "MISSING_PARAMS", message: "Thiếu license key hoặc domain" };
    }

    if (timestamp && signature) {
      const now = Date.now();
      if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
        return { valid: false, code: "EXPIRED_REQUEST", message: "Yêu cầu đã hết hạn" };
      }
      const expectedSig = generateSignature(key, domain, timestamp);
      if (signature !== expectedSig) {
        return { valid: false, code: "INVALID_SIGNATURE", message: "Chữ ký không hợp lệ" };
      }
    }

    const cleanDomain = cleanDomainInput(domain);

    const cacheKey = `activate:${key}:${cleanDomain}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    if (key.length > 50 || !/^[A-Z0-9-]+$/.test(key)) {
      return { valid: false, code: "INVALID_KEY", message: "License key không hợp lệ" };
    }

    const license = await licenseRepository.getByKey(key);

    if (!license) {
      const result = { valid: false, code: "INVALID_KEY", message: "License key không hợp lệ" };
      setCache(cacheKey, result, 2 * 60 * 1000);
      return result;
    }

    if (license.status === "revoked") {
      const result = { valid: false, code: "REVOKED", message: "License đã bị thu hồi" };
      setCache(cacheKey, result, 2 * 60 * 1000);
      return result;
    }

    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      const result = { valid: false, code: "EXPIRED", message: "License đã hết hạn" };
      setCache(cacheKey, result, 2 * 60 * 1000);
      return result;
    }

    if (license.domain && license.domain !== cleanDomain) {
      return { valid: false, code: "DOMAIN_MISMATCH", message: "License không được cấp cho domain này" };
    }

    if (!license.domain || license.status === "unused") {
      await licenseRepository.update(license.id, {
        domain: cleanDomain,
        status: "active",
        activatedAt: license.activatedAt || new Date(),
      });
      invalidateCache(`verify:${cleanDomain}`);
    }

    const result = {
      valid: true,
      code: "VALID",
      message: "License hợp lệ",
      license: {
        productName: license.productName,
        domain: license.domain || cleanDomain,
        expiresAt: license.expiresAt,
      },
    };

    setCache(cacheKey, result);
    return result;
  },
};
