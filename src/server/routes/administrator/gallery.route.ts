import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { galleryService } from "@/server/services/administrator/gallery.service";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

export const galleryRouter = router({
  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await galleryService.getItems();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách thư viện ảnh",
      });
    }
  }),

  add: publicProcedure
    .input(
      z.object({
        url: z.string().min(1, "Đường dẫn không được trống"),
        fileName: z.string().min(1, "Tên file không được trống"),
        size: z.number().int().nonnegative().default(0),
        mediaType: z.string().min(1, "Định dạng file không được trống"),
        storageType: z.string().min(1, "Nơi lưu trữ không được trống"),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await galleryService.addItem(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể thêm ảnh vào thư viện",
        });
      }
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().uuid("ID không hợp lệ"),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await galleryService.deleteItem(input.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa ảnh khỏi thư viện",
        });
      }
    }),
});
