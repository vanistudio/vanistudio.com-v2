import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { licensesService } from "@/server/services/administrator/licenses.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
  return session;
}

const createLicenseSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn người sở hữu"),
  productId: z.string().uuid("Vui lòng chọn sản phẩm hợp lệ"),
  licenseKey: z.string().min(1, "Mã bản quyền không được để trống"),
  status: z.enum(["active", "suspended", "expired", "revoked"]).default("active"),
  allowedDomains: z.array(z.string()).default([]),
  allowedIps: z.array(z.string()).default([]),
  maxActivations: z.number().int().positive().default(1),
  expiresAt: z.string().nullable().optional().transform((val) => (val ? new Date(val) : null)),
});

const updateLicenseSchema = z.object({
  status: z.enum(["active", "suspended", "expired", "revoked"]).optional(),
  allowedDomains: z.array(z.string()).optional(),
  allowedIps: z.array(z.string()).optional(),
  maxActivations: z.number().int().positive().optional(),
  expiresAt: z.string().nullable().optional().transform((val) => (val === undefined ? undefined : val ? new Date(val) : null)),
});

export const licensesRouter = router({
  getList: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().positive().optional().default(1),
        limit: z.number().int().positive().optional().default(10),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        status: z.string().optional(),
        productId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await licensesService.getLicensesList(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách bản quyền",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        const license = await licensesService.getLicenseById(input.id);
        if (!license) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy bản quyền",
          });
        }
        return license;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi hệ thống khi tải thông tin bản quyền",
        });
      }
    }),

  create: publicProcedure
    .input(createLicenseSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await licensesService.createLicense(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Tạo bản quyền thất bại",
        });
      }
    }),

  update: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateLicenseSchema }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await licensesService.updateLicense(input.id, input.data);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật bản quyền thất bại",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await licensesService.deleteLicense(input.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa bản quyền thất bại",
        });
      }
    }),

  getProducts: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await licensesService.getActiveProducts();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách sản phẩm",
      });
    }
  }),

  searchUsers: publicProcedure
    .input(z.object({ query: z.string().default("") }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await licensesService.searchUsers(input.query);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi tìm kiếm người dùng",
        });
      }
    }),
});
