import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { products } from "@/schemas/product.schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";

export const productsPublicRoutes = new Elysia({ prefix: "/products" })
  .get("/", async ({ query }) => {
    try {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const data = await db.select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        tagline: products.tagline,
        description: products.description,
        thumbnail: products.thumbnail,
        coverImage: products.coverImage,
        type: products.type,
        status: products.status,
        price: products.price,
        salePrice: products.salePrice,
        currency: products.currency,
        techStack: products.techStack,
        tags: products.tags,
        isFeatured: products.isFeatured,
        version: products.version,
      })
        .from(products)
        .where(eq(products.status, "published"))
        .orderBy(asc(products.sortOrder), desc(products.createdAt))
        .limit(limit);

      return { success: true, products: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const [product] = await db.select().from(products)
        .where(and(eq(products.slug, params.slug), eq(products.status, "published")))
        .limit(1);

      if (!product) return { success: false, error: "Không tìm thấy sản phẩm" };

      // Increment view count
      await db.update(products)
        .set({ viewCount: sql`${products.viewCount} + 1` })
        .where(eq(products.id, product.id));

      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
