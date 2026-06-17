import { router, publicProcedure } from "../t";
import { z } from "zod";
import { db } from "@/server/db";
import { apiProducts, apiOverviews, apiGroups, apiEndpoints } from "@/server/db/schemas/api.schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const publicApiDocsRouter = router({
  getApiProducts: publicProcedure.query(async () => {
    try {
      return await db
        .select()
        .from(apiProducts)
        .orderBy(asc(apiProducts.order), desc(apiProducts.createdAt));
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách sản phẩm/API",
      });
    }
  }),

  getOverviews: publicProcedure
    .input(z.object({ apiType: z.string() }))
    .query(async ({ input }) => {
      try {
        return await db
          .select()
          .from(apiOverviews)
          .where(
            and(
              eq(apiOverviews.apiType, input.apiType),
              eq(apiOverviews.isActive, true)
            )
          )
          .orderBy(asc(apiOverviews.title));
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách tài liệu tổng quan",
        });
      }
    }),

  getOverviewBySlug: publicProcedure
    .input(z.object({ slug: z.string(), apiType: z.string() }))
    .query(async ({ input }) => {
      try {
        const [result] = await db
          .select()
          .from(apiOverviews)
          .where(
            and(
              eq(apiOverviews.slug, input.slug),
              eq(apiOverviews.apiType, input.apiType),
              eq(apiOverviews.isActive, true)
            )
          )
          .limit(1);

        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy tài liệu tổng quan",
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi hệ thống khi tải tài liệu",
        });
      }
    }),

  getGroupsWithEndpoints: publicProcedure
    .input(z.object({ apiType: z.string() }))
    .query(async ({ input }) => {
      try {
        const groups = await db
          .select()
          .from(apiGroups)
          .where(eq(apiGroups.apiType, input.apiType))
          .orderBy(asc(apiGroups.order));

        const endpoints = await db
          .select({ endpoint: apiEndpoints })
          .from(apiEndpoints)
          .innerJoin(apiGroups, eq(apiEndpoints.groupId, apiGroups.id))
          .where(
            and(
              eq(apiGroups.apiType, input.apiType),
              eq(apiEndpoints.isActive, true)
            )
          )
          .orderBy(asc(apiEndpoints.name));

        const endpointsList = endpoints.map((r) => r.endpoint);

        return groups.map((group) => ({
          ...group,
          endpoints: endpointsList.filter((ep) => ep.groupId === group.id),
        }));
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách nhóm & API",
        });
      }
    }),

  getEndpointById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const [result] = await db
          .select()
          .from(apiEndpoints)
          .where(
            and(
              eq(apiEndpoints.id, input.id),
              eq(apiEndpoints.isActive, true)
            )
          )
          .limit(1);

        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy API Endpoint",
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi hệ thống khi tải chi tiết API",
        });
      }
    }),
});
