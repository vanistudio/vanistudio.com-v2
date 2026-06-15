import { db } from "@/server/db";
import {
  products,
  type Product,
  type NewProduct,
} from "@/server/db/schemas/product.schema";
import { eq, desc, asc, or, like, sql, count } from "drizzle-orm";

export interface GetProductsParams {
  search?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  all?: boolean;
}

export class ProductsRepository {
  async getProducts(): Promise<Product[]> {
    return await db.query.products.findMany({
      orderBy: [asc(products.order), desc(products.createdAt)],
    });
  }

  async getProductsList(params: GetProductsParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = undefined;
    if (params.search && params.search.trim()) {
      const searchPattern = `%${params.search.trim()}%`;
      whereClause = or(
        like(products.name, searchPattern),
        like(products.slug, searchPattern),
        like(products.description, searchPattern)
      );
    }

    const sortField = params.sortField || "order";
    const sortOrder = params.sortOrder || "asc";

    let orderBySpec;
    if (sortField === "name") {
      orderBySpec = sortOrder === "desc" ? desc(products.name) : asc(products.name);
    } else if (sortField === "price") {
      orderBySpec = sortOrder === "desc" ? desc(products.price) : asc(products.price);
    } else if (sortField === "createdAt") {
      orderBySpec = sortOrder === "desc" ? desc(products.createdAt) : asc(products.createdAt);
    } else {
      orderBySpec = sortOrder === "desc" ? desc(products.order) : asc(products.order);
    }

    const [countResult] = await db
      .select({ count: count() })
      .from(products)
      .where(whereClause);
    const total = Number(countResult?.count || 0);

    let items;
    if (params.all) {
      items = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBySpec);
    } else {
      items = await db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBySpec)
        .limit(limit)
        .offset(offset);
    }

    const [statsResult] = await db
      .select({
        totalProducts: sql<number>`count(*)`,
        activeProducts: sql<number>`count(case when status = 'active' then 1 end)`,
        featuredProducts: sql<number>`count(case when is_featured = true then 1 end)`,
      })
      .from(products);

    return {
      items,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      stats: {
        totalProducts: Number(statsResult?.totalProducts || 0),
        activeProducts: Number(statsResult?.activeProducts || 0),
        featuredProducts: Number(statsResult?.featuredProducts || 0),
      },
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    return product || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    return product || null;
  }

  async createProduct(data: NewProduct): Promise<Product> {
    let orderToSet = data.order;
    if (orderToSet === undefined || orderToSet === 0) {
      const allProducts = await db.select({ order: products.order }).from(products);
      const maxOrder = allProducts.reduce((max, p) => Math.max(max, p.order || 0), 0);
      orderToSet = maxOrder + 1;
    }
    const [inserted] = await db.insert(products).values({ ...data, order: orderToSet }).returning();
    if (!inserted) throw new Error("Tạo sản phẩm thất bại");
    return inserted;
  }

  async updateProduct(id: string, data: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    if (!updated) throw new Error("Cập nhật sản phẩm thất bại hoặc không tìm thấy");
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }
}

export const productsRepository = new ProductsRepository();
