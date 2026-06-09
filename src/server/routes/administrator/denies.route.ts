import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { deniesService } from "@/server/services/administrator/denies.service";

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

export const deniesRouter = router({
  getStats: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(10),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      })
    )
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await deniesService.getStats(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách IP bị chặn",
        });
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        ip: z.string().min(1, "Địa chỉ IP không được để trống"),
        reason: z.string().optional(),
        expiresAt: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAdmin();
      const whoBanned = session.user.username || session.user.name || "Admin";
      
      try {
        const result = await deniesService.createDeny({
          ip: input.ip,
          reason: input.reason,
          whoBanned,
          expiresAt: input.expiresAt,
        });

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
          message: error.message || "Không thể thêm IP vào danh sách chặn",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        ip: z.string().min(1, "Địa chỉ IP không được để trống"),
        reason: z.string().optional(),
        expiresAt: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await deniesService.updateDeny(input.id, {
          ip: input.ip,
          reason: input.reason,
          expiresAt: input.expiresAt,
        });

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
          message: error.message || "Không thể cập nhật thông tin chặn IP",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await deniesService.deleteDeny(input.id);
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
          message: error.message || "Không thể gỡ chặn IP",
        });
      }
    }),
});
