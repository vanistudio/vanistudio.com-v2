import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { apiService } from "@/server/services/administrator/api.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

// Định nghĩa Parameter Schema của Zod
const parameterSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean", "object", "array"]),
  required: z.boolean(),
  description: z.string(),
  placeholder: z.string().optional().nullable(),
  defaultValue: z.any().optional().nullable(),
});

// Định nghĩa Response Sample Schema của Zod
const responseSampleSchema = z.object({
  status: z.number(),
  description: z.string(),
  body: z.any(),
});

export const apiDocsRouter = router({
  // --- Overviews ---
  getOverviews: publicProcedure
    .input(z.object({ apiType: z.string().optional() }).optional())
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.getOverviews(input?.apiType);
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
      await ensureAdmin();
      try {
        return await apiService.getOverviewBySlug(input.slug, input.apiType);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải chi tiết tài liệu",
        });
      }
    }),

  getOverviewById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.getOverviewById(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải chi tiết tài liệu",
        });
      }
    }),

  upsertOverview: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        apiType: z.string().min(1, "Loại API không được để trống"),
        title: z.string().min(1, "Tiêu đề không được để trống"),
        slug: z.string().min(1, "Slug không được để trống"),
        description: z.string().optional().nullable(),
        content: z.string().min(1, "Nội dung không được để trống"),
        thumbnail: z.string().optional().nullable(),
        metaTitle: z.string().optional().nullable(),
        metaDescription: z.string().optional().nullable(),
        metaKeywords: z.string().optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.upsertOverview(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể lưu tài liệu tổng quan",
        });
      }
    }),

  deleteOverview: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.deleteOverview(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa tài liệu tổng quan",
        });
      }
    }),

  // --- Groups ---
  getGroupsWithEndpoints: publicProcedure
    .input(z.object({ apiType: z.string().optional() }).optional())
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.getGroupsWithEndpoints(input?.apiType);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách API",
        });
      }
    }),

  upsertGroup: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        apiType: z.string().min(1, "Loại API không được để trống"),
        name: z.string().min(1, "Tên nhóm API không được để trống"),
        slug: z.string().min(1, "Slug nhóm API không được để trống"),
        description: z.string().optional().nullable(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.upsertGroup(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể lưu nhóm API",
        });
      }
    }),

  deleteGroup: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.deleteGroup(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa nhóm API",
        });
      }
    }),

  // --- Endpoints ---
  upsertEndpoint: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        groupId: z.string().min(1, "Nhóm API bắt buộc chọn"),
        name: z.string().min(1, "Tên API không được để trống"),
        method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
        path: z.string().min(1, "Đường dẫn không được để trống"),
        description: z.string().min(1, "Mô tả không được để trống"),
        headers: z.array(parameterSchema).optional().nullable(),
        queryParams: z.array(parameterSchema).optional().nullable(),
        requestBody: z.array(parameterSchema).optional().nullable(),
        responses: z.array(responseSampleSchema).optional().nullable(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.upsertEndpoint(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể lưu API Endpoint",
        });
      }
    }),

  getEndpointById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.getEndpointById(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải chi tiết API Endpoint",
        });
      }
    }),

  deleteEndpoint: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.deleteEndpoint(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa API Endpoint",
        });
      }
    }),

  // --- API Products ---
  getApiProducts: publicProcedure
    .query(async () => {
      await ensureAdmin();
      try {
        return await apiService.getApiProducts();
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách sản phẩm/API",
        });
      }
    }),

  upsertApiProduct: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Tên sản phẩm/API không được để trống"),
        slug: z.string().min(1, "Slug không được để trống"),
        description: z.string().optional().nullable(),
        thumbnail: z.string().optional().nullable(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.upsertApiProduct(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể lưu sản phẩm/API",
        });
      }
    }),

  deleteApiProduct: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.deleteApiProduct(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa sản phẩm/API",
        });
      }
    }),

  reorderGroups: publicProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.reorderGroups(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể cập nhật thứ tự nhóm API",
        });
      }
    }),

  reorderApiProducts: publicProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await apiService.reorderApiProducts(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể cập nhật thứ tự sản phẩm/API",
        });
      }
    }),

  seedApiDocs: publicProcedure
    .input(z.array(z.any()).optional().nullable())
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await apiService.seedApiDocs(input || undefined);
        return { resultCode: 0, message: "Đổ dữ liệu mẫu API thành công!" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể đổ dữ liệu mẫu API",
        });
      }
    }),
});
