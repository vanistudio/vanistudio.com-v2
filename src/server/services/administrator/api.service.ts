import { apiRepository } from "@/server/repositories/api.repository";
import { type ApiOverview, type ApiGroup, type ApiEndpoint } from "@/server/db/schemas/api.schema";

export class ApiService {
  // --- Overviews ---
  async getOverviews(): Promise<ApiOverview[]> {
    return await apiRepository.getOverviews();
  }

  async getOverviewBySlug(slug: string): Promise<ApiOverview> {
    const doc = await apiRepository.getOverviewBySlug(slug);
    if (!doc) throw new Error("Không tìm thấy tài liệu tổng quan");
    return doc;
  }

  async upsertOverview(data: {
    id?: string;
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
    if (!data.title.trim()) throw new Error("Tiêu đề không được để trống");
    if (!data.slug.trim()) throw new Error("Slug không được để trống");
    if (!data.content.trim()) throw new Error("Nội dung tài liệu không được để trống");
    return await apiRepository.upsertOverview(data);
  }

  async deleteOverview(id: string): Promise<boolean> {
    return await apiRepository.deleteOverview(id);
  }

  // --- Groups & Endpoints ---
  async getGroupsWithEndpoints() {
    const groups = await apiRepository.getGroups();
    const endpoints = await apiRepository.getEndpoints();
    
    return groups.map(group => ({
      ...group,
      endpoints: endpoints.filter(ep => ep.groupId === group.id)
    }));
  }

  async upsertGroup(data: {
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
    order?: number;
  }): Promise<ApiGroup> {
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
    editionRequired?: string[];
    isActive?: boolean;
  }): Promise<ApiEndpoint> {
    if (!data.groupId) throw new Error("Vui lòng chọn nhóm API");
    if (!data.name.trim()) throw new Error("Tên API không được để trống");
    if (!data.method.trim()) throw new Error("Phương thức không được để trống");
    if (!data.path.trim()) throw new Error("Đường dẫn API không được để trống");
    if (!data.description.trim()) throw new Error("Mô tả API không được để trống");
    return await apiRepository.upsertEndpoint(data);
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    return await apiRepository.deleteEndpoint(id);
  }
}

export const apiService = new ApiService();
