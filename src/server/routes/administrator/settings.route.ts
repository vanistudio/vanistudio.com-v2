import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { settingsService } from "@/server/services/administrator/settings.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const settingsRouter = router({
  get: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await settingsService.getSettings();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải cấu hình hệ thống",
      });
    }
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        siteName: z.string().min(1, "Tên trang web không được để trống"),
        siteUrl: z.string().min(1, "Địa chỉ trang web không được để trống"),
        siteLogo: z.string().optional().nullable(),
        siteFavicon: z.string().optional().nullable(),
        siteMetaDescription: z.string().optional().nullable(),
        siteMetaKeywords: z.string().optional().nullable(),
        siteMetaAuthor: z.string().optional().nullable(),
        siteOgImage: z.string().optional().nullable(),
        siteColor: z.string().min(1, "Mã màu không được để trống"),
        siteTimezone: z.string().min(1, "Múi giờ không được để trống"),
        siteLanguage: z.string().min(1, "Ngôn ngữ không được để trống"),
        siteCurrency: z.string().min(1, "Tiền tệ không được để trống"),
        siteFontConfig: z.object({
          primaryFont: z.string().min(1, "Phông chữ chính không được để trống"),
          secondaryFont: z.string().optional(),
          fontWeights: z.array(z.string()),
        }),
        siteMaintenanceMode: z.object({
          enabled: z.boolean(),
          message: z.string(),
        }),
        siteGlobalPopup: z.object({
          enabled: z.boolean(),
          htmlContent: z.string(),
        }),
        siteCustomCodes: z.object({
          head: z.string(),
          body: z.string(),
          css: z.string(),
          js: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const { id, ...data } = input;
        return await settingsService.updateSettings(id, data);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể cập nhật cấu hình hệ thống",
        });
      }
    }),
});
