import { db } from "@/server/db";
import { 
  apiOverviews, 
  apiGroups, 
  apiEndpoints,
  apiProducts,
  type ApiOverview, 
  type ApiGroup, 
  type ApiEndpoint,
  type ApiProduct
} from "@/server/db/schemas/api.schema";
import { eq, asc, and, desc } from "drizzle-orm";

export class ApiRepository {
  // --- Overviews ---
  async getOverviews(apiType?: string): Promise<ApiOverview[]> {
    const query = db.select().from(apiOverviews);
    if (apiType) {
      return await query.where(eq(apiOverviews.apiType, apiType)).orderBy(asc(apiOverviews.title));
    }
    return await query.orderBy(asc(apiOverviews.title));
  }

  async getOverviewBySlug(slug: string, apiType: string): Promise<ApiOverview | null> {
    const [result] = await db
      .select()
      .from(apiOverviews)
      .where(and(eq(apiOverviews.slug, slug), eq(apiOverviews.apiType, apiType)))
      .limit(1);
    return result || null;
  }

  async getOverviewById(id: string): Promise<ApiOverview | null> {
    const [result] = await db.select().from(apiOverviews).where(eq(apiOverviews.id, id)).limit(1);
    return result || null;
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
  async getGroups(apiType?: string): Promise<ApiGroup[]> {
    const query = db.select().from(apiGroups);
    if (apiType) {
      return await query.where(eq(apiGroups.apiType, apiType)).orderBy(asc(apiGroups.order));
    }
    return await query.orderBy(asc(apiGroups.order));
  }

  async upsertGroup(data: {
    id?: string;
    apiType: string;
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

  async updateGroupOrder(id: string, order: number): Promise<void> {
    await db.update(apiGroups).set({ order, updatedAt: new Date() }).where(eq(apiGroups.id, id));
  }

  // --- Endpoints ---
  async getEndpoints(groupId?: string, apiType?: string): Promise<ApiEndpoint[]> {
    if (groupId) {
      return await db.select().from(apiEndpoints).where(eq(apiEndpoints.groupId, groupId)).orderBy(asc(apiEndpoints.name));
    }
    if (apiType) {
      const results = await db
        .select({ endpoint: apiEndpoints })
        .from(apiEndpoints)
        .innerJoin(apiGroups, eq(apiEndpoints.groupId, apiGroups.id))
        .where(eq(apiGroups.apiType, apiType))
        .orderBy(asc(apiEndpoints.name));
      return results.map(r => r.endpoint);
    }
    return await db.select().from(apiEndpoints).orderBy(asc(apiEndpoints.name));
  }

  async getEndpointById(id: string): Promise<ApiEndpoint | null> {
    const [result] = await db.select().from(apiEndpoints).where(eq(apiEndpoints.id, id)).limit(1);
    return result || null;
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

  // --- API Products ---
  async getApiProducts(): Promise<ApiProduct[]> {
    return await db.select().from(apiProducts).orderBy(asc(apiProducts.order), desc(apiProducts.createdAt));
  }

  async getApiProductBySlug(slug: string): Promise<ApiProduct | null> {
    const [result] = await db.select().from(apiProducts).where(eq(apiProducts.slug, slug)).limit(1);
    return result || null;
  }

  async upsertApiProduct(data: {
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
    thumbnail?: string | null;
    order?: number;
  }): Promise<ApiProduct> {
    const { id, ...insertData } = data;
    if (id) {
      const [updated] = await db
        .update(apiProducts)
        .set({ ...insertData, updatedAt: new Date() })
        .where(eq(apiProducts.id, id))
        .returning();
      if (!updated) throw new Error("Không tìm thấy loại API để cập nhật");
      return updated;
    } else {
      const [inserted] = await db.insert(apiProducts).values(insertData).returning();
      return inserted;
    }
  }

  async deleteApiProduct(id: string): Promise<boolean> {
    const [deleted] = await db.delete(apiProducts).where(eq(apiProducts.id, id)).returning();
    return !!deleted;
  }

  async updateApiProductOrder(id: string, order: number): Promise<void> {
    await db.update(apiProducts).set({ order, updatedAt: new Date() }).where(eq(apiProducts.id, id));
  }
}

export const apiRepository = new ApiRepository();
