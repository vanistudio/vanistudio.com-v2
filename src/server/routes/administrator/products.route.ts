import { router, publicProcedure } from "../t";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "@/lib/auth";
import { productsService } from "@/server/services/administrator/products.service";
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

const productFeatureSchema = z.object({
  name: z.string().min(1, "Tên tính năng không được để trống"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

const changelogItemSchema = z.object({
  version: z.string().min(1, "Phiên bản không được để trống"),
  date: z.string().min(1, "Ngày cập nhật không được để trống"),
  title: z.string().optional().nullable(),
  changes: z.array(z.string()).default([]),
});

const createProductSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  slug: z.string().min(1, "Đường dẫn không được để trống"),
  description: z.string().optional().nullable(),
  content: z.string().min(1, "Nội dung chi tiết không được để trống"),
  type: z.string().default("source_code"),
  status: z.string().default("active"),
  thumbnail: z.string().optional().nullable(),
  gallery: z.array(z.string()).default([]),
  
  price: z.number().int().default(0),
  salePrice: z.number().int().optional().nullable(),
  currency: z.string().default("USD"),
  badge: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  
  version: z.string().default("1.0.0"),
  licenseType: z.string().default("single"),
  supportMonths: z.number().int().default(6),
  fileSize: z.string().optional().nullable(),
  compatibility: z.array(z.string()).default([]),
  
  demoUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  downloadUrl: z.string().optional().nullable(),
  
  features: z.array(productFeatureSchema).default([]),
  changelog: z.array(changelogItemSchema).default([]),
  metadata: z.record(z.string(), z.any()).default({}),
  order: z.number().int().default(0),
});

const updateProductSchema = createProductSchema.partial();

export const productsRouter = router({
  getAll: publicProcedure.query(async () => {
    await ensureAdmin();
    try {
      return await productsService.getProducts();
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "Không thể tải danh sách sản phẩm",
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
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
        all: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        return await productsService.getProductsList(input);
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Không thể tải danh sách sản phẩm",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      await ensureAdmin();
      try {
        const product = await productsService.getProductById(input.id);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Không tìm thấy sản phẩm",
          });
        }
        return product;
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Lỗi hệ thống khi tìm sản phẩm",
        });
      }
    }),

  create: publicProcedure
    .input(createProductSchema)
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await productsService.createProduct(input as any);
        try {
          revalidatePath("/products");
          revalidatePath("/products/" + result.slug);
        } catch (_) {}
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Tạo sản phẩm thất bại",
        });
      }
    }),

  update: publicProcedure
    .input(z.object({ id: z.string().uuid(), data: updateProductSchema }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const result = await productsService.updateProduct(input.id, input.data as any);
        try {
          revalidatePath("/products");
          revalidatePath("/products/" + result.slug);
        } catch (_) {}
        return result;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Cập nhật sản phẩm thất bại",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        const product = await productsService.getProductById(input.id);
        if (product) {
          await productsService.deleteProduct(input.id);
          try {
            revalidatePath("/products");
            revalidatePath("/products/" + product.slug);
          } catch (_) {}
        }
        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Xóa sản phẩm thất bại",
        });
      }
    }),

  reorderProducts: publicProcedure
    .input(z.array(z.object({ id: z.string().uuid(), order: z.number().int() })))
    .mutation(async ({ input }) => {
      await ensureAdmin();
      try {
        await productsService.reorderProducts(input);
        try {
          revalidatePath("/products");
        } catch (_) {}
        return { resultCode: 0, message: "Cập nhật thứ tự sản phẩm thành công" };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Cập nhật thứ tự sản phẩm thất bại",
        });
      }
    }),
});
