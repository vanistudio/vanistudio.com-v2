import { router, publicProcedure } from "../t";
import { z } from "zod";
import { authenticationService } from "@/server/services/authentication/authentication.service";
import { TRPCError } from "@trpc/server";
import { extensionsRepository } from "@/server/repositories/administrator/extensions.repository";

export const authenticationRouter = router({
  getRegistrationConfig: publicProcedure.query(async () => {
    try {
      const ext = await extensionsRepository.getExtensionById("user_registration_customizer");
      if (!ext) {
        throw new Error("Gói cấu hình đăng ký không tồn tại.");
      }
      return {
        isEnabled: ext.isEnabled,
        config: ext.config as any,
      };
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải cấu hình đăng ký",
      });
    }
  }),

  login: publicProcedure
    .input(
      z.object({
        identity: z.string().min(1, "Email hoặc Tên tài khoản không được để trống"),
        password: z.string().min(1, "Mật khẩu không được để trống"),
      })
    )
    .mutation(async ({ input }) => {
      return await authenticationService.login(input);
    }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().optional().or(z.literal("")),
        username: z.string().optional().or(z.literal("")),
        name: z.string().min(1, "Họ và tên không được để trống"),
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        phone: z.string().optional().or(z.literal("")),
        identityCard: z.string().optional().or(z.literal("")),
        taxId: z.string().optional().or(z.literal("")),
        address1: z.string().optional().or(z.literal("")),
        address2: z.string().optional().or(z.literal("")),
        city: z.string().optional().or(z.literal("")),
        district: z.string().optional().or(z.literal("")),
        state: z.string().optional().or(z.literal("")),
        postalCode: z.string().optional().or(z.literal("")),
        country: z.string().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await authenticationService.register(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Đăng ký thất bại",
        });
      }
    }),
});
