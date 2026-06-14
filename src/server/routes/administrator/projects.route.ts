import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { projectsService } from "@/server/services/administrator/projects.service";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const session = await getServerSession(true);
  if (!session?.user || session.user.role !== "admin") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
  return session;
}

const projectMediaSchema = z.object({
  url: z.string().url("URL không hợp lệ"),
  caption: z.string().optional().nullable(),
  type: z.enum(["image", "video"]).default("image"),
});

const projectMetricSchema = z.object({
  label: z.string().min(1, "Nhãn không được để trống"),
  value: z.string().min(1, "Giá trị không được để trống"),
  icon: z.string().optional().nullable(),
});

const projectLinkSchema = z.object({
  label: z.string().min(1, "Tên liên kết không được để trống"),
  url: z.string().url("URL không hợp lệ"),
  type: z.enum(["live", "github", "figma", "youtube", "docs", "other"]).default("live"),
  icon: z.string().optional().nullable(),
});

const projectMemberSchema = z.object({
  name: z.string().min(1, "Tên thành viên không được để trống"),
  role: z.string().min(1, "Vai trò không được để trống"),
  avatar: z.string().optional().nullable(),
  profileUrl: z.string().optional().nullable(),
});

const projectTestimonialSchema = z.object({
  content: z.string().min(1, "Nội dung nhận xét không được để trống"),
  author: z.string().min(1, "Tên người đánh giá không được để trống"),
  role: z.string().min(1, "Chức vụ không được để trống"),
  avatar: z.string().optional().nullable(),
});

const projectHighlightSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  image: z.string().optional().nullable(),
});

const createProjectSchema = z.object({
  name: z.string().min(1, "Tên dự án không được để trống"),
  slug: z.string().min(1, "Đường dẫn không được để trống"),
  description: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung chi tiết không được để trống"),
  thumbnail: z.string().optional().nullable(),
  difficulty: z.number().int().default(3),
  projectType: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  startDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  endDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  serviceId: z.string().uuid("ID dịch vụ không hợp lệ").optional().nullable(),
  mediaGallery: z.array(projectMediaSchema).default([]),
  metrics: z.array(projectMetricSchema).default([]),
  links: z.array(projectLinkSchema).default([]),
  highlights: z.array(projectHighlightSchema).default([]),
  team: z.array(projectMemberSchema).default([]),
  testimonials: z.array(projectTestimonialSchema).default([]),
  order: z.number().int().default(0),
});

const updateProjectSchema = createProjectSchema.partial();

export const projectsRouter = router({
  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await projectsService.getProjects();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách dự án",
      });
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        const project = await projectsService.getProjectById(input.id);
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy dự án",
          });
        }
        return project;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi hệ thống khi tìm dự án",
        });
      }
    }),

  create: publicProcedure
    .input(createProjectSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await projectsService.createProject(input as any);
        try {
          revalidatePath("/projects");
          revalidatePath("/projects/" + result.slug);
        } catch (_) {}
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Tạo dự án thất bại",
        });
      }
    }),

  update: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateProjectSchema }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await projectsService.updateProject(input.id, input.data as any);
        try {
          revalidatePath("/projects");
          revalidatePath("/projects/" + result.slug);
        } catch (_) {}
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật dự án thất bại",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const project = await projectsService.getProjectById(input.id);
        if (project) {
          await projectsService.deleteProject(input.id);
          try {
            revalidatePath("/projects");
            revalidatePath("/projects/" + project.slug);
          } catch (_) {}
        }
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa dự án thất bại",
        });
      }
    }),

  reorderProjects: publicProcedure
    .input(z.array(z.object({ id: z.string().uuid(), order: z.number().int() })))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await projectsService.reorderProjects(input);
        try {
          revalidatePath("/projects");
        } catch (_) {}
        return { resultCode: 0, message: "Cập nhật thứ tự dự án thành công" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Cập nhật thứ tự dự án thất bại",
        });
      }
    }),
});
