import { db } from "@/server/db";
import { 
  apiOverviews, 
  apiGroups, 
  apiEndpoints,
  type ApiOverview, 
  type ApiGroup, 
  type ApiEndpoint 
} from "@/server/db/schemas/api.schema";
import { eq, asc } from "drizzle-orm";

export class ApiRepository {
  // --- Overviews ---
  async getOverviews(): Promise<ApiOverview[]> {
    return await db.select().from(apiOverviews).orderBy(asc(apiOverviews.title));
  }

  async getOverviewBySlug(slug: string): Promise<ApiOverview | null> {
    const [result] = await db.select().from(apiOverviews).where(eq(apiOverviews.slug, slug)).limit(1);
    return result || null;
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
    const { id, ...insertData } = data;
    if (id) {
      const [updated] = await db
        .update(apiOverviews)
        .set({ ...insertData, updatedAt: new Date() })
        .where(eq(apiOverviews.id, id))
        .returning();
      if (!updated) throw new Error("Không tìm thấy tài liệu tổng quan để cập nhật");
      return updated;
    } else {
      const [inserted] = await db.insert(apiOverviews).values(insertData).returning();
      return inserted;
    }
  }

  async deleteOverview(id: string): Promise<boolean> {
    const [deleted] = await db.delete(apiOverviews).where(eq(apiOverviews.id, id)).returning();
    return !!deleted;
  }

  // --- Groups ---
  async getGroups(): Promise<ApiGroup[]> {
    return await db.select().from(apiGroups).orderBy(asc(apiGroups.order));
  }

  async upsertGroup(data: {
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
    order?: number;
  }): Promise<ApiGroup> {
    const { id, ...insertData } = data;
    if (id) {
      const [updated] = await db
        .update(apiGroups)
        .set({ ...insertData, updatedAt: new Date() })
        .where(eq(apiGroups.id, id))
        .returning();
      if (!updated) throw new Error("Không tìm thấy nhóm API để cập nhật");
      return updated;
    } else {
      const [inserted] = await db.insert(apiGroups).values(insertData).returning();
      return inserted;
    }
  }

  async deleteGroup(id: string): Promise<boolean> {
    const [deleted] = await db.delete(apiGroups).where(eq(apiGroups.id, id)).returning();
    return !!deleted;
  }

  // --- Endpoints ---
  async getEndpoints(groupId?: string): Promise<ApiEndpoint[]> {
    const query = db.select().from(apiEndpoints);
    if (groupId) {
      return await query.where(eq(apiEndpoints.groupId, groupId)).orderBy(asc(apiEndpoints.name));
    }
    return await query.orderBy(asc(apiEndpoints.name));
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
    const { id, ...insertData } = data;
    if (id) {
      const [updated] = await db
        .update(apiEndpoints)
        .set({ ...insertData, updatedAt: new Date() })
        .where(eq(apiEndpoints.id, id))
        .returning();
      if (!updated) throw new Error("Không tìm thấy API Endpoint để cập nhật");
      return updated;
    } else {
      const [inserted] = await db.insert(apiEndpoints).values(insertData).returning();
      return inserted;
    }
  }

  async deleteEndpoint(id: string): Promise<boolean> {
    const [deleted] = await db.delete(apiEndpoints).where(eq(apiEndpoints.id, id)).returning();
    return !!deleted;
  }
}

export const apiRepository = new ApiRepository();
