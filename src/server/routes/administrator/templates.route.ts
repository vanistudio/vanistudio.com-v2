import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { notificationTemplatesService } from "@/server/services/administrator/templates.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const templatesRouter = router({
  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await notificationTemplatesService.getTemplates();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách mẫu thông báo",
      });
    }
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        subject: z.string().optional().nullable(),
        content: z.string().min(1, "Nội dung mẫu không được để trống"),
        extraConfig: z.object({
          senderName: z.string().optional(),
          senderEmail: z.string().optional(),
          parseMode: z.enum(["HTML", "Markdown", "MarkdownV2", "PlainText"]).optional(),
          discordEmbeds: z.array(z.any()).optional(),
          slackBlocks: z.array(z.any()).optional(),
          telegramInlineKeyboard: z.any().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const { id, ...data } = input;
        return await notificationTemplatesService.updateTemplate(id, data);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể cập nhật mẫu thông báo",
        });
      }
    }),

  resetToDefault: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await notificationTemplatesService.resetTemplateToDefault(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể khôi phục mẫu thông báo về mặc định",
        });
      }
    }),

  resetAllToDefault: publicProcedure.mutation(async () => {
    await ensureAdmin();
    try {
      return await notificationTemplatesService.resetAllTemplatesToDefault();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể khôi phục toàn bộ mẫu thông báo về mặc định",
      });
    }
  }),
});
