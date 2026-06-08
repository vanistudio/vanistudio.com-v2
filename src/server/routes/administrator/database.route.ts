import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { databaseService } from "@/server/services/administrator/database.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const databaseRouter = router({
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
        return await databaseService.getStats(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải cấu trúc và dung lượng các bảng dữ liệu",
        });
      }
    }),
});
