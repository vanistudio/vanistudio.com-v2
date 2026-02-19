import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { products } from "@/schemas/product.schema";
import { categories } from "@/schemas/category.schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";

export const productsPublicRoutes = new Elysia({ prefix: "/products" })
  .get("/categories", async () => {
    try {
      const data = await db.select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        icon: categories.icon,
      })
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder));

      return { success: true, categories: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/", async ({ query }) => {
    try {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const conditions: any[] = [eq(products.status, "published")];

      if (query.categoryId) {
        conditions.push(eq(products.categoryId, query.categoryId));
      }

      const whereClause = conditions.length > 1
        ? and(...conditions)
        : conditions[0];

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
        .where(whereClause)
        .orderBy(asc(products.sortOrder), desc(products.createdAt))
        .limit(limit);

      return { success: true, products: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const [product] = await db.select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        tagline: products.tagline,
        description: products.description,
        content: products.content,
        thumbnail: products.thumbnail,
        coverImage: products.coverImage,
        images: products.images,
        videoUrl: products.videoUrl,
        demoUrl: products.demoUrl,
        documentationUrl: products.documentationUrl,
        changelogUrl: products.changelogUrl,
        type: products.type,
        status: products.status,
        price: products.price,
        salePrice: products.salePrice,
        currency: products.currency,
        techStack: products.techStack,
        tags: products.tags,
        frameworks: products.frameworks,
        version: products.version,
        compatibility: products.compatibility,
        requirements: products.requirements,
        fileSize: products.fileSize,
        viewCount: products.viewCount,
        downloadCount: products.downloadCount,
        purchaseCount: products.purchaseCount,
        rating: products.rating,
        ratingCount: products.ratingCount,
        features: products.features,
        highlights: products.highlights,
        warrantyMonths: products.warrantyMonths,
        supportEmail: products.supportEmail,
        supportIncluded: products.supportIncluded,
        isFeatured: products.isFeatured,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      }).from(products)
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
