import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { usersService } from "@/server/services/administrator/users.service";

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

export const usersRouter = router({
  getStats: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        role: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await usersService.getStats(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách người dùng",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().optional(),
        role: z.string().optional(),
        banned: z.boolean().optional(),
        banReason: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAdmin();
      try {
        const result = await usersService.updateUser(
          input.id,
          {
            name: input.name,
            role: input.role,
            banned: input.banned,
            banReason: input.banReason,
          },
          session.user.id
        );

        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể cập nhật thông tin người dùng",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const session = await ensureAdmin();
      try {
        const result = await usersService.deleteUser(input.id, session.user.id);
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa người dùng này",
        });
      }
    }),

  getFullDetails: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await usersService.getUserFullDetails(input.id);
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải chi tiết người dùng",
        });
      }
    }),

  updateFullDetails: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        user: z.object({
          name: z.string().min(1).optional(),
          username: z.string().nullable().optional(),
          role: z.string().optional(),
          banned: z.boolean().optional(),
          banReason: z.string().nullable().optional(),
          emailVerified: z.boolean().optional(),
          image: z.string().nullable().optional(),
        }),
        profile: z.object({
          phone: z.string().nullable().optional(),
          address1: z.string().nullable().optional(),
          address2: z.string().nullable().optional(),
          city: z.string().nullable().optional(),
          district: z.string().nullable().optional(),
          state: z.string().nullable().optional(),
          postalCode: z.string().nullable().optional(),
          country: z.string().nullable().optional(),
          identityCard: z.string().nullable().optional(),
          taxId: z.string().nullable().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAdmin();
      try {
        const result = await usersService.updateUserFullDetails(
          input.id,
          {
            user: input.user,
            profile: input.profile,
          },
          session.user.id
        );
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể cập nhật chi tiết người dùng",
        });
      }
    }),

  revokeSession: publicProcedure
    .input(z.object({ sessionId: z.string().min(1), userId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await usersService.revokeSession(input.sessionId, input.userId);
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể thu hồi phiên đăng nhập",
        });
      }
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự"),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await usersService.resetPassword(input.userId, input.password);
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể đặt lại mật khẩu cho thành viên này",
        });
      }
    }),
});
