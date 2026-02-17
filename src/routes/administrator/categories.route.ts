import { Elysia, t } from "elysia";
import { categoriesController } from "@/controllers/administrator/categories.controller";
import { adminProxy } from "@/proxies/administrator.proxy";

export const categoriesRoutes = new Elysia({ prefix: "/categories" })
  .use(adminProxy)
  .get("/", async () => {
    try {
      const categories = await categoriesController.getAll();
      return { success: true, categories };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/", async ({ body }) => {
    try {
      const category = await categoriesController.create(body);
      return { success: true, category };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String(),
      slug: t.String(),
      description: t.Optional(t.String()),
      icon: t.Optional(t.String()),
      coverImage: t.Optional(t.String()),
      sortOrder: t.Optional(t.Number()),
      metaTitle: t.Optional(t.String()),
      metaDescription: t.Optional(t.String()),
    }),
  })
  .patch("/:id", async ({ params, body }) => {
    try {
      const category = await categoriesController.update(params.id, body);
      return { success: true, category };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .delete("/:id", async ({ params }) => {
    try {
      await categoriesController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
