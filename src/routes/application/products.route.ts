import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { products } from "@/schemas/product.schema";
import { eq, desc, asc } from "drizzle-orm";

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
  });
