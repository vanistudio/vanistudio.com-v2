import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { telegramService } from "@/server/services/application/telegram.service";

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

export const telegramRouter = router({
  getAccounts: publicProcedure.query(async () => {
    const session = await ensureAuthenticated();
    try {
      return await telegramService.getAccounts(session.user.id);
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách tài khoản Telegram",
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
        return await telegramService.getAccountsList(session.user.id, input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách tài khoản Telegram",
        });
      }
    }),

  sendLoginCode: publicProcedure
    .input(
      z.object({
        phone: z.string().min(8, "Số điện thoại quá ngắn"),
        proxy: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.sendLoginCode(
          session.user.id,
          input.phone,
          input.proxy || undefined
        );
      } catch (error: any) {
        console.error("sendLoginCode error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể gửi mã đăng nhập Telegram",
        });
      }
    }),

  submitLoginCode: publicProcedure
    .input(
      z.object({
        phone: z.string().min(8),
        code: z.string().min(4, "Mã xác thực không hợp lệ"),
        password: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.submitLoginCode(
          session.user.id,
          input.phone,
          input.code,
          input.password || undefined
        );
      } catch (error: any) {
        console.error("submitLoginCode error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xác thực mã OTP thất bại",
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
        return await telegramService.updateProxy(
          input.accountId,
          session.user.id,
          input.proxy
        );
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
        await telegramService.deleteAccount(input.accountId, session.user.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa tài khoản thất bại",
        });
      }
    }),

  checkProxy: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.checkProxy(input.accountId, session.user.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Kiểm tra Proxy thất bại",
        });
      }
    }),

  getAutoResponder: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.getAutoResponder(input.accountId, session.user.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải cấu hình phản hồi tự động",
        });
      }
    }),

  updateAutoResponder: publicProcedure
    .input(
      z.object({
        accountId: z.string(),
        isActive: z.boolean(),
        replyText: z.string().min(1, "Nội dung phản hồi không được để trống"),
        detectionMode: z.enum(["always", "idle", "outside_work_hours"]),
        inactivityMinutes: z.number().int().nonnegative(),
        workDays: z.array(z.number()),
        workStartHour: z.string(),
        workEndHour: z.string(),
        timezone: z.string().optional(),
        cooldownHours: z.number().nonnegative(),
        markAsRead: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      const { accountId, ...configData } = input;
      try {
        return await telegramService.updateAutoResponder(
          accountId,
          session.user.id,
          configData
        );
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật cấu hình phản hồi tự động thất bại",
        });
      }
    }),

  getLogs: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.getLogs(input.accountId, session.user.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải lịch sử hoạt động",
        });
      }
    }),

  getLogsList: publicProcedure
    .input(
      z.object({
        accountId: z.string(),
        search: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(10),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        event: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const session = await ensureAuthenticated();
      const { accountId, ...params } = input;
      try {
        return await telegramService.getLogsList(accountId, session.user.id, params);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải lịch sử hoạt động",
        });
      }
    }),

  getAccountStats: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.getAccountStats(input.accountId, session.user.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải thống kê tài khoản Telegram",
        });
      }
    }),

  clearLogs: publicProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        await telegramService.clearLogs(input.accountId, session.user.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể xóa lịch sử hoạt động",
        });
      }
    }),

  getChatDetails: publicProcedure
    .input(
      z.object({
        accountId: z.string(),
        chatId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.getChatDetails(input.accountId, input.chatId, session.user.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải chi tiết cuộc trò chuyện",
        });
      }
    }),

  leaveChat: publicProcedure
    .input(
      z.object({
        accountId: z.string(),
        chatId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await ensureAuthenticated();
      try {
        return await telegramService.leaveChat(input.accountId, input.chatId, session.user.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Rời nhóm/kênh thất bại",
        });
      }
    }),
});
