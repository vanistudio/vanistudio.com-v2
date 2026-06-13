import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { servicesService } from "@/server/services/administrator/services.service";
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

const formFieldConfigSchema = z.object({
  key: z.string().min(1, "Key không được để trống"),
  label: z.string().min(1, "Label không được để trống"),
  type: z.enum(["text", "textarea", "select", "multiselect", "checkbox", "number", "file"]),
  required: z.boolean(),
  placeholder: z.string().optional().nullable(),
  options: z.array(z.string()).optional().nullable(),
  defaultValue: z.any().optional().nullable(),
});

const serviceFeatureSchema = z.object({
  name: z.string().min(1, "Tên tính năng không được để trống"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

const createServiceSchema = z.object({
  name: z.string().min(1, "Tên dịch vụ không được để trống"),
  slug: z.string().min(1, "Đường dẫn không được để trống"),
  typeId: z.string().uuid("ID loại dịch vụ không hợp lệ"),
  description: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung không được để trống"),
  thumbnail: z.string().optional().nullable(),
  gallery: z.array(z.string()).default([]),
  features: z.array(serviceFeatureSchema).default([]),
  technologies: z.array(z.string()).default([]),
  basePrice: z.number().int().nonnegative().default(0),
  priceType: z.enum(["starting_at", "fixed", "contact"]).default("starting_at"),
  deliveryTime: z.number().int().positive().nullable().optional(),
  status: z.enum(["active", "draft", "disabled"]).default("active"),
  fieldsConfig: z.array(formFieldConfigSchema).default([]),
  metadata: z.record(z.string(), z.any()).default({}),
});

const updateServiceSchema = createServiceSchema.partial();

const createTypeSchema = z.object({
  name: z.string().min(1, "Tên loại dịch vụ không được để trống"),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  bg: z.string().optional().nullable(),
  border: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

const updateTypeSchema = createTypeSchema.partial();

const packageSchema = z.object({
  serviceId: z.string().uuid("ID dịch vụ không hợp lệ"),
  name: z.string().min(1, "Tên gói không được để trống"),
  description: z.string().min(1, "Mô tả gói không được để trống"),
  price: z.number().int().nonnegative(),
  deliveryTime: z.number().int().positive(),
  featuresIncluded: z.record(z.string(), z.any()).default({}),
});

const updatePackageSchema = packageSchema.partial();

const updateRequestSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "completed", "cancelled"]).optional(),
  price: z.number().int().nonnegative().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const servicesRouter = router({
  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await servicesService.getServices();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách dịch vụ",
      });
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        const service = await servicesService.getServiceById(input.id);
        if (!service) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy dịch vụ",
          });
        }
        return service;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi hệ thống khi tìm dịch vụ",
        });
      }
    }),

  create: publicProcedure
    .input(createServiceSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await servicesService.createService(input);
        try {
          revalidatePath("/services");
          revalidatePath("/services/" + result.slug);
        } catch (_) {}
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Tạo dịch vụ thất bại",
        });
      }
    }),

  update: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateServiceSchema }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await servicesService.updateService(input.id, input.data);
        try {
          revalidatePath("/services");
          revalidatePath("/services/" + result.slug);
        } catch (_) {}
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật dịch vụ thất bại",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const service = await servicesService.getServiceById(input.id);
        if (service) {
          await servicesService.deleteService(input.id);
          try {
            revalidatePath("/services");
            revalidatePath("/services/" + service.slug);
          } catch (_) {}
        }
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa dịch vụ thất bại",
        });
      }
    }),

  getPackages: publicProcedure
    .input(z.object({ serviceId: z.string().uuid() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await servicesService.getPackagesByServiceId(input.serviceId);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách gói dịch vụ",
        });
      }
    }),

  createPackage: publicProcedure
    .input(packageSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await servicesService.createPackage(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Tạo gói dịch vụ thất bại",
        });
      }
    }),

  updatePackage: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updatePackageSchema }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await servicesService.updatePackage(input.id, input.data);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật gói dịch vụ thất bại",
        });
      }
    }),

  deletePackage: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await servicesService.deletePackage(input.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa gói dịch vụ thất bại",
        });
      }
    }),

  getRequests: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await servicesService.getRequests();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách yêu cầu dịch vụ",
      });
    }
  }),

  updateRequest: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateRequestSchema }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        return await servicesService.updateRequest(input.id, input.data);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật yêu cầu thất bại",
        });
      }
    }),

  deleteRequest: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await servicesService.deleteRequest(input.id);
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa yêu cầu thất bại",
        });
      }
    }),

  getTypes: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await servicesService.getTypes();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách phân loại dịch vụ",
      });
    }
  }),

  createType: publicProcedure
    .input(createTypeSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await servicesService.createType(input);
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Tạo phân loại thất bại",
        });
      }
    }),

  updateType: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateTypeSchema }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await servicesService.updateType(input.id, input.data);
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Cập nhật phân loại thất bại",
        });
      }
    }),

  deleteType: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await servicesService.deleteType(input.id);
        if (result.resultCode < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.message,
          });
        }
        return result;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Xóa phân loại thất bại",
        });
      }
    }),

  reorderTypes: publicProcedure
    .input(z.array(z.object({ id: z.string().uuid(), order: z.number().int() })))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await servicesService.reorderTypes(input);
        return { resultCode: 0, message: "Cập nhật thứ tự thành công" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Cập nhật thứ tự thất bại",
        });
      }
    }),

  seedTypes: publicProcedure
    .input(
      z.array(
        z.object({
          name: z.string(),
          icon: z.string().optional().nullable(),
          description: z.string().optional().nullable(),
          color: z.string().optional().nullable(),
          bg: z.string().optional().nullable(),
          border: z.string().optional().nullable(),
          order: z.number().int(),
        })
      ).optional()
    )
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await servicesService.seedTypes(input);
        return { resultCode: 0, message: "Đổ dữ liệu mẫu thành công" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Đổ dữ liệu mẫu thất bại",
        });
      }
    }),
});
