import { productsRepository } from "@/server/repositories/products.repository";
import {
  type Product,
  type NewProduct,
} from "@/server/db/schemas/product.schema";

export class ProductsService {
  async getProducts(): Promise<Product[]> {
    return await productsRepository.getProducts();
  }

  async getProductsList(params: any) {
    const result = await productsRepository.getProductsList(params);
    return {
      resultCode: 0,
      message: "Success",
      data: {
        items: result.items,
        stats: result.stats,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    return await productsRepository.getProductById(id);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return await productsRepository.getProductBySlug(slug);
  }

  async createProduct(data: Omit<NewProduct, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    if (!data.name?.trim()) throw new Error("Tên sản phẩm không được để trống");
    if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
    if (!data.content?.trim()) throw new Error("Nội dung giới thiệu không được để trống");

    const existing = await productsRepository.getProductBySlug(data.slug);
    if (existing) {
      throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
    }

    return await productsRepository.createProduct(data);
  }

  async updateProduct(id: string, data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product> {
    const product = await productsRepository.getProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm cần cập nhật");

    if (data.name !== undefined && !data.name?.trim()) {
      throw new Error("Tên sản phẩm không được để trống");
    }

    if (data.slug !== undefined) {
      if (!data.slug?.trim()) throw new Error("Đường dẫn (slug) không được để trống");
      const existing = await productsRepository.getProductBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new Error(`Đường dẫn (slug) "${data.slug}" đã tồn tại. Vui lòng chọn đường dẫn khác.`);
      }
    }

    return await productsRepository.updateProduct(id, data);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await productsRepository.getProductById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm để xóa");
    await productsRepository.deleteProduct(id);
  }

  async reorderProducts(orders: { id: string; order: number }[]) {
    for (const item of orders) {
      await productsRepository.updateProduct(item.id, { order: item.order });
    }
  }
}

export const productsService = new ProductsService();
