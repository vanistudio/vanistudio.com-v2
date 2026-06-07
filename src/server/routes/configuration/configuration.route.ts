import { router, publicProcedure } from "../t";
import { z } from "zod";
import { configurationService } from "@/server/services/configuration/configuration.service";

export const configurationRouter = router({
  status: publicProcedure.query(async () => {
    const isConfigured = await configurationService.checkStatus();
    return { configured: isConfigured };
  }),

  setup: publicProcedure
    .input(
      z.object({
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
        admin: z.object({
          name: z.string().min(1, "Tên quản trị viên không được để trống"),
          email: z.string().email("Email quản trị viên không hợp lệ"),
          password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await configurationService.setupSite(input);
      return { success: true };
    }),
});
