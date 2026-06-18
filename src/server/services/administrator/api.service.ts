import { apiRepository } from "@/server/repositories/api.repository";
import { type ApiOverview, type ApiGroup, type ApiEndpoint, type ApiProduct } from "@/server/db/schemas/api.schema";
import { db } from "@/server/db";
import { apiOverviews, apiGroups, apiEndpoints } from "@/server/db/schemas/api.schema";
import { eq } from "drizzle-orm";
import { DEFAULT_API_DOCS } from "@/defaults/api-docs.default";

export class ApiService {
  async getOverviews(apiType?: string): Promise<ApiOverview[]> {
    return await apiRepository.getOverviews(apiType);
  }

  async getOverviewBySlug(slug: string, apiType: string): Promise<ApiOverview> {
    const doc = await apiRepository.getOverviewBySlug(slug, apiType);
    if (!doc) throw new Error("Không tìm thấy tài liệu tổng quan");
    return doc;
  }

  async getOverviewById(id: string): Promise<ApiOverview> {
    const doc = await apiRepository.getOverviewById(id);
    if (!doc) throw new Error("Không tìm thấy tài liệu tổng quan");
    return doc;
  }

  async upsertOverview(data: {
    id?: string;
    apiType: string;
    title: string;
    slug: string;
    description?: string | null;
    content: string;
    thumbnail?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    isActive?: boolean;
  }): Promise<ApiOverview> {
    if (!data.apiType || !data.apiType.trim()) throw new Error("Loại API không được để trống");
    if (!data.title.trim()) throw new Error("Tiêu đề không được để trống");
    if (!data.slug.trim()) throw new Error("Slug không được để trống");
    if (!data.content.trim()) throw new Error("Nội dung tài liệu không được để trống");
    return await apiRepository.upsertOverview(data);
  }

  async deleteOverview(id: string): Promise<boolean> {
    return await apiRepository.deleteOverview(id);
  }

  async getGroupsWithEndpoints(apiType?: string) {
    const groups = await apiRepository.getGroups(apiType);
    const endpoints = await apiRepository.getEndpoints(undefined, apiType);
    
    return groups.map(group => ({
      ...group,
      endpoints: endpoints.filter(ep => ep.groupId === group.id)
    }));
  }

  async upsertGroup(data: {
    id?: string;
    apiType: string;
    name: string;
    slug: string;
    description?: string | null;
    order?: number;
  }): Promise<ApiGroup> {
    if (!data.apiType || !data.apiType.trim()) throw new Error("Loại API không được để trống");
    if (!data.name.trim()) throw new Error("Tên nhóm API không được để trống");
    if (!data.slug.trim()) throw new Error("Slug nhóm API không được để trống");
    return await apiRepository.upsertGroup(data);
  }

  async deleteGroup(id: string): Promise<boolean> {
    return await apiRepository.deleteGroup(id);
  }

  async upsertEndpoint(data: {
    id?: string;
    groupId: string;
    name: string;
    method: string;
    path: string;
    description: string;
    headers?: any;
    queryParams?: any;
    requestBody?: any;
    responses?: any;
    isActive?: boolean;
  }): Promise<ApiEndpoint> {
    if (!data.groupId) throw new Error("Vui lòng chọn nhóm API");
    if (!data.name.trim()) throw new Error("Tên API không được để trống");
    if (!data.method.trim()) throw new Error("Phương thức không được để trống");
    if (!data.path.trim()) throw new Error("Đường dẫn API không được để trống");
    if (!data.description.trim()) throw new Error("Mô tả API không được để trống");
    return await apiRepository.upsertEndpoint(data);
  }

  async getEndpointById(id: string): Promise<ApiEndpoint> {
    const ep = await apiRepository.getEndpointById(id);
    if (!ep) throw new Error("Không tìm thấy API Endpoint");
    return ep;
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    return await apiRepository.deleteEndpoint(id);
  }

  async getApiProducts(): Promise<ApiProduct[]> {
    return await apiRepository.getApiProducts();
  }

  async upsertApiProduct(data: {
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    order?: number;
  }): Promise<ApiProduct> {
    if (!data.name.trim()) throw new Error("Tên sản phẩm/API không được để trống");
    if (!data.slug.trim()) throw new Error("Slug sản phẩm/API không được để trống");
    
    const existing = await apiRepository.getApiProductBySlug(data.slug);
    if (existing && existing.id !== data.id) {
      throw new Error("Slug đã tồn tại, vui lòng chọn slug khác");
    }

    return await apiRepository.upsertApiProduct(data);
  }

  async deleteApiProduct(id: string): Promise<boolean> {
    const allProducts = await apiRepository.getApiProducts();
    const target = allProducts.find(p => p.id === id);
    if (!target) throw new Error("Không tìm thấy loại API để xóa");

    await db.delete(apiOverviews).where(eq(apiOverviews.apiType, target.slug));
    
    const groups = await apiRepository.getGroups(target.slug);
    for (const group of groups) {
      await db.delete(apiEndpoints).where(eq(apiEndpoints.groupId, group.id));
    }
    await db.delete(apiGroups).where(eq(apiGroups.apiType, target.slug));

    return await apiRepository.deleteApiProduct(id);
  }

  async reorderGroups(orders: { id: string; order: number }[]) {
    for (const item of orders) {
      await apiRepository.updateGroupOrder(item.id, item.order);
    }
  }

  async reorderApiProducts(orders: { id: string; order: number }[]) {
    for (const item of orders) {
      await apiRepository.updateApiProductOrder(item.id, item.order);
    }
  }

  async seedApiDocs(customProducts?: any[]) {
    const dataToSeed = customProducts || DEFAULT_API_DOCS;
    await apiRepository.seedDefaultApiDocs(dataToSeed);
  }
}

export const apiService = new ApiService();
