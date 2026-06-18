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
import { eq, asc, and, desc, inArray } from "drizzle-orm";

export class ApiRepository {
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

  async seedDefaultApiDocs(customProducts: any[]): Promise<void> {
    const productsToSeed = customProducts || [];
    const productSlugs = productsToSeed.map((p) => p.slug);

    if (productSlugs.length > 0) {
      const groups = await db
        .select({ id: apiGroups.id })
        .from(apiGroups)
        .where(inArray(apiGroups.apiType, productSlugs));

      const groupIds = groups.map((g) => g.id);
      if (groupIds.length > 0) {
        await db.delete(apiEndpoints).where(inArray(apiEndpoints.groupId, groupIds));
      }

      await db.delete(apiOverviews).where(inArray(apiOverviews.apiType, productSlugs));
      await db.delete(apiGroups).where(inArray(apiGroups.apiType, productSlugs));
      await db.delete(apiProducts).where(inArray(apiProducts.slug, productSlugs));
    }

    for (let i = 0; i < productsToSeed.length; i++) {
      const prod = productsToSeed[i];
      await db.insert(apiProducts).values({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        thumbnail: prod.thumbnail,
        order: (i + 1) * 10,
      });

      if (prod.overviews && Array.isArray(prod.overviews)) {
        for (const ov of prod.overviews) {
          await db.insert(apiOverviews).values({
            apiType: prod.slug,
            title: ov.title,
            slug: ov.slug,
            description: ov.description || null,
            content: ov.content,
            isActive: true,
          });
        }
      } else if (prod.overviewTitle) {
        await db.insert(apiOverviews).values({
          apiType: prod.slug,
          title: prod.overviewTitle,
          slug: prod.overviewSlug,
          description: prod.overviewDescription || null,
          content: prod.overviewContent,
          isActive: true,
        });
      }

      for (let gIdx = 0; gIdx < prod.groups.length; gIdx++) {
        const groupData = prod.groups[gIdx];
        const [insertedGroup] = await db
          .insert(apiGroups)
          .values({
            apiType: prod.slug,
            name: groupData.name,
            slug: groupData.slug,
            description: groupData.description || null,
            order: (gIdx + 1) * 10,
          })
          .returning();

        for (const ep of groupData.endpoints) {
          await db.insert(apiEndpoints).values({
            groupId: insertedGroup.id,
            name: ep.name,
            method: ep.method,
            path: ep.path,
            description: ep.description,
            headers: ep.headers || [],
            queryParams: ep.queryParams || [],
            requestBody: ep.requestBody || [],
            responses: ep.responses || [],
            isActive: true,
          });
        }
      }
    }
  }
}

export const apiRepository = new ApiRepository();
