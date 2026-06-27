import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { discordService } from "@/server/services/application/discord.service";

async function ensureAuthenticated() {
  const session = await getServerSession(true);
  if (!session?.user || !session.user.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn cần đăng nhập để thực hiện hành động này",
    });
  }
  return session;
}

export const discordRouter = router({
  getAccounts: publicProcedure.query(async () => {
    const session = await ensureAuthenticated();
    try {
      return await discordService.getAccounts(session.user.id);
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách tài khoản Discord",
      });
    }
  }),

  getAccountsList: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(10),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await discordService.getAccountsList(session.user.id, input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách tài khoản Discord",
        });
      }
    }),

  createAccount: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token không được để trống"),
        proxy: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await discordService.createAccount({
          userId: session.user.id,
          token: input.token,
          proxy: input.proxy || null,
        });
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Thêm tài khoản Discord thất bại",
        });
      }
    }),

  updateProxy: publicProcedure
    .input(
      z.object({
        accountId: z.string(),
        proxy: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await discordService.updateProxy(input.accountId, session.user.id, input.proxy);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật Proxy thất bại",
        });
      }
    }),

  deleteAccount: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        await discordService.deleteAccount(input.accountId, session.user.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa tài khoản thất bại",
        });
      }
    }),

  getPresets: publicProcedure.query(async () => {
    const session = await ensureAuthenticated();
    try {
      return await discordService.getPresets(session.user.id);
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách preset",
      });
    }
  }),

  createPreset: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Tên preset không được để trống"),
        onlineStatus: z.string().optional(),
        customStatusText: z.string().nullable().optional(),
        customStatusEmoji: z.string().nullable().optional(),
        customStatusExpiry: z.string().nullable().optional(),
        activities: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await discordService.createPreset({
          userId: session.user.id,
          name: input.name,
          onlineStatus: input.onlineStatus,
          customStatusText: input.customStatusText ?? undefined,
          customStatusEmoji: input.customStatusEmoji ?? undefined,
          customStatusExpiry: input.customStatusExpiry ?? undefined,
          activities: input.activities,
        });
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Tạo preset thất bại",
        });
      }
    }),

  updatePreset: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        onlineStatus: z.string().optional(),
        customStatusText: z.string().nullable().optional(),
        customStatusEmoji: z.string().nullable().optional(),
        customStatusExpiry: z.string().nullable().optional(),
        activities: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      const { id, ...rest } = input;
      try {
        return await discordService.updatePreset(id, session.user.id, {
          name: rest.name,
          onlineStatus: rest.onlineStatus,
          customStatusText: rest.customStatusText ?? undefined,
          customStatusEmoji: rest.customStatusEmoji ?? undefined,
          customStatusExpiry: rest.customStatusExpiry ?? undefined,
          activities: rest.activities,
        });
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật preset thất bại",
        });
      }
    }),

  deletePreset: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        await discordService.deletePreset(input.id, session.user.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa preset thất bại",
        });
      }
    }),

  getLogs: publicProcedure
    .input(
      z.object({
        accountId: z.string(),
        search: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(10),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        actionType: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const session = await ensureAuthenticated();
      const { accountId, ...params } = input;
      try {
        return await discordService.getLogs(accountId, session.user.id, params);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải lịch sử hoạt động",
        });
      }
    }),

  clearLogs: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        await discordService.clearLogs(input.accountId, session.user.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể xóa lịch sử hoạt động",
        });
      }
    }),
});
