import { deniesRepository, GetDeniesParams } from "@/server/repositories/administrator/denies.repository";
import { getIPInfo } from "@/server/plugins/ip.plugin";

const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])$/i;

export class DeniesService {
  async getStats(params: GetDeniesParams) {
    const result = await deniesRepository.getDeniesList(params);

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

  async getDeny(id: string) {
    const item = await deniesRepository.findById(id);
    if (!item) {
      throw new Error("Không tìm thấy IP trong danh sách chặn");
    }
    return {
      resultCode: 0,
      message: "Success",
      data: item,
    };
  }

  async createDeny(data: { ip: string; reason?: string; whoBanned: string; expiresAt?: string | null }) {
    const trimmedIp = data.ip.trim();
    if (!ipRegex.test(trimmedIp)) {
      return { resultCode: -1, message: "Định dạng IP không hợp lệ." };
    }

    const existing = await deniesRepository.findByIp(trimmedIp);
    if (existing) {
      return { resultCode: -2, message: "IP này đã nằm trong danh sách chặn." };
    }

    let geoData: any = { isp: null, city: null, country: null, lat: null, lon: null };
    try {
      const ipInfo = await getIPInfo(trimmedIp);
      if (ipInfo && Object.keys(ipInfo).length > 0) {
        geoData = ipInfo;
      } else if (
        trimmedIp.startsWith("192.") ||
        trimmedIp.startsWith("10.") ||
        trimmedIp === "127.0.0.1" ||
        trimmedIp === "::1" ||
        trimmedIp === "localhost"
      ) {
        geoData = {
          isp: "LAN / Internal Network",
          country: "Localhost",
          city: "QA Environment",
          lat: 0,
          lon: 0,
        };
      }
    } catch (err) {
    }

    const inserted = await deniesRepository.createDeny({
      ip: trimmedIp,
      reason: data.reason || "Vi phạm chính sách",
      whoBanned: data.whoBanned,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isp: geoData.isp,
      city: geoData.city,
      country: geoData.country,
      latitude: geoData.lat ? String(geoData.lat) : null,
      longitude: geoData.lon ? String(geoData.lon) : null,
    });

    return {
      resultCode: 0,
      message: "Đã thêm IP vào danh sách đen.",
      data: inserted,
    };
  }

  async updateDeny(id: string, data: { ip: string; reason?: string; expiresAt?: string | null }) {
    const existing = await deniesRepository.findById(id);
    if (!existing) {
      return { resultCode: -1, message: "Không tìm thấy dữ liệu chặn này." };
    }

    const trimmedIp = data.ip.trim();
    if (!ipRegex.test(trimmedIp)) {
      return { resultCode: -1, message: "Định dạng IP không hợp lệ." };
    }

    const requiresGeoRefresh = trimmedIp !== existing.ip || !existing.isp;

    if (trimmedIp !== existing.ip) {
      const duplicate = await deniesRepository.findByIp(trimmedIp);
      if (duplicate) {
        return { resultCode: -2, message: "IP này đã nằm trong danh sách chặn." };
      }
    }

    let geoData: any = {
      isp: existing.isp,
      city: existing.city,
      country: existing.country,
      lat: existing.latitude,
      lon: existing.longitude,
    };

    if (requiresGeoRefresh) {
      try {
        const ipInfo = await getIPInfo(trimmedIp);
        if (ipInfo && Object.keys(ipInfo).length > 0) {
          geoData = ipInfo;
        } else if (
          trimmedIp.startsWith("192.") ||
          trimmedIp.startsWith("10.") ||
          trimmedIp === "127.0.0.1" ||
          trimmedIp === "::1" ||
          trimmedIp === "localhost"
        ) {
          geoData = {
            isp: "LAN / Internal Network",
            country: "Localhost",
            city: "QA Environment",
            lat: 0,
            lon: 0,
          };
        }
      } catch (err) {
      }
    }

    const updated = await deniesRepository.updateDeny(id, {
      ip: trimmedIp,
      reason: data.reason || "Vi phạm chính sách",
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isp: geoData.isp,
      city: geoData.city,
      country: geoData.country,
      latitude: geoData.lat ? String(geoData.lat) : null,
      longitude: geoData.lon ? String(geoData.lon) : null,
    });

    return {
      resultCode: 0,
      message: "Đã cập nhật IP chặn.",
      data: updated,
    };
  }

  async deleteDeny(id: string) {
    const existing = await deniesRepository.findById(id);
    if (!existing) {
      return { resultCode: -1, message: "Không tìm thấy dữ liệu chặn này." };
    }

    const deleted = await deniesRepository.deleteDeny(id);
    return {
      resultCode: 0,
      message: "Gỡ chặn IP thành công.",
      data: deleted,
    };
  }
}

export const deniesService = new DeniesService();
