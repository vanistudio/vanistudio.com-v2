import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { blogService } from "@/server/services/administrator/blog.service";
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
  isFeatured: z.boolean().default(false),
  views: z.number().default(0),
  likes: z.number().default(0),
  readingTime: z.number().default(0),
  tags: z.array(z.string()).default([]),
  authorId: z.string().optional().nullable(),
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
  isFeatured: z.boolean().optional(),
  views: z.number().optional(),
  likes: z.number().optional(),
  readingTime: z.number().optional(),
  tags: z.array(z.string()).optional(),
  authorId: z.string().optional().nullable(),
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
  isFeatured: z.boolean().default(false).optional(),
  views: z.number().default(0).optional(),
  likes: z.number().default(0).optional(),
  readingTime: z.number().default(0).optional(),
  tags: z.array(z.string()).default([]).optional(),
  authorId: z.string().optional().nullable(),
  publishedAt: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date().optional().nullable()),
});

export const blogRouter = router({
  seedBlogs: publicProcedure
    .input(
      z.object({
        customBlogs: z.array(seedSchema).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await blogService.seedBlogs(input.customBlogs);
        revalidatePath("/blog");
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể gieo dữ liệu mẫu bài viết Blog",
        });
      }
    }),

  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await blogService.getBlogs();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách bài viết Blog",
      });
    }
  }),

  getStats: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(10),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await blogService.getBlogsList(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách bài viết Blog",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid("ID không hợp lệ") }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        const blog = await blogService.getBlogById(input.id);
        if (!blog) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy bài viết Blog",
          });
        }
        return blog;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi khi tìm kiếm bài viết Blog",
        });
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const blog = await blogService.getBlogBySlug(input.slug);
        return blog;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi khi tìm kiếm bài viết Blog theo slug",
        });
      }
    }),

  create: publicProcedure
    .input(createSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const blog = await blogService.createBlog(input);
        revalidatePath("/blog");
        if (blog.isActive) {
          revalidatePath("/blog/" + blog.slug);
        }
        return blog;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể tạo bài viết Blog",
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
        const oldBlog = await blogService.getBlogById(input.id);
        const oldSlug = oldBlog?.slug;

        const updated = await blogService.updateBlog(input.id, input.data);

        revalidatePath("/blog");
        if (oldSlug) {
          revalidatePath("/blog/" + oldSlug);
        }
        if (updated.slug !== oldSlug) {
          revalidatePath("/blog/" + updated.slug);
        }

        return updated;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Không thể cập nhật bài viết Blog",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid("ID không hợp lệ") }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const blog = await blogService.getBlogById(input.id);
        const slug = blog?.slug;

        await blogService.deleteBlog(input.id);

        revalidatePath("/blog");
        if (slug) {
          revalidatePath("/blog/" + slug);
        }

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể xóa bài viết Blog",
        });
      }
    }),
});
