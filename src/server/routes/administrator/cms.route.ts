import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { cmsService } from "@/server/services/administrator/cms.service";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
}

const createSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string().min(1, "Đường dẫn không được để trống"),
  description: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung không được để trống"),
  thumbnail: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const updateSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").optional(),
  slug: z.string().min(1, "Đường dẫn không được để trống").optional(),
  description: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung không được để trống").optional(),
  thumbnail: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const seedSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string().min(1, "Đường dẫn không được để trống"),
  description: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung không được để trống"),
  thumbnail: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  publishedAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().optional().nullable()),
});

export const cmsRouter = router({
  seedPages: publicProcedure
    .input(
      z.object({
        customPages: z.array(seedSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await cmsService.seedPages(input.customPages);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể đổ dữ liệu mẫu trang CMS",
        });
      }
    }),

  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await cmsService.getPages();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách trang CMS",
      });
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid("ID không hợp lệ") }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        const page = await cmsService.getPageById(input.id);
        if (!page) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy trang CMS",
          });
        }
        return page;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi khi tìm kiếm trang CMS",
        });
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const page = await cmsService.getPageBySlug(input.slug);
        return page;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi khi tìm kiếm trang CMS theo slug",
        });
      }
    }),

  create: publicProcedure
    .input(createSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const page = await cmsService.createPage(input);
        if (page.isActive) {
          revalidatePath("/" + page.slug);
        }
        return page;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể tạo trang CMS",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().uuid("ID không hợp lệ"),
        data: updateSchema,
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const oldPage = await cmsService.getPageById(input.id);
        const oldSlug = oldPage?.slug;

        const updated = await cmsService.updatePage(input.id, input.data);

        if (oldSlug) {
          revalidatePath("/" + oldSlug);
        }
        if (updated.slug !== oldSlug) {
          revalidatePath("/" + updated.slug);
        }

        return updated;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể cập nhật trang CMS",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid("ID không hợp lệ") }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const page = await cmsService.getPageById(input.id);
        const slug = page?.slug;

        await cmsService.deletePage(input.id);

        if (slug) {
          revalidatePath("/" + slug);
        }

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa trang CMS",
        });
      }
    }),
});
