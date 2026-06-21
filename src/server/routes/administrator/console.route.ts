import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { consoleService } from "@/server/services/administrator/console.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const consoleRouter = router({
  getSystemInfo: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await consoleService.getSystemInfo();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải thông tin hệ thống",
      });
    }
  }),

  runCommand: publicProcedure
    .input(
      z.object({
        command: z.string().min(1, "Lệnh không được để trống"),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await consoleService.runCommand(input.command);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Thực thi lệnh thất bại",
        });
      }
    }),
});
