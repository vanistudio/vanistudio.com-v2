import { Elysia } from "elysia";
import { productService } from "@/server/services/product.service";
import { categoryService } from "@/server/services/category.service";

export const productsPublicRoutes = new Elysia({ prefix: "/products" })
  .get("/categories", async () => {
    try {
      const categories = await categoryService.getActiveCategories();
      return { success: true, categories };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/", async ({ query }) => {
    try {
      const limit = Math.min(parseInt(query.limit || "20"), 50);
      const data = await productService.getPublished({
        limit,
        categoryId: query.categoryId || undefined,
      });

      return { success: true, products: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:slug", async ({ params }) => {
    try {
      const product = await productService.getBySlugAndStatus(params.slug, "published");

      await productService.incrementViewCount(product.id);

      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
