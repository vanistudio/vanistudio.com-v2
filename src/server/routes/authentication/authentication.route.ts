import { router, publicProcedure } from "../t";
import { z } from "zod";
import { authenticationService } from "@/server/services/authentication/authentication.service";

export const authenticationRouter = router({
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
});
