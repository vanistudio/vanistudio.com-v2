import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { extensionsService } from "@/server/services/administrator/extensions.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const extensionsRouter = router({
  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await extensionsService.getAllExtensions();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách gói mở rộng",
      });
    }
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        isEnabled: z.boolean().optional(),
        config: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const { id, isEnabled, config } = input;
        return await extensionsService.updateExtension(id, { isEnabled, config });
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể cập nhật gói mở rộng",
        });
      }
    }),
});
