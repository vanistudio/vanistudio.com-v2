import { Elysia, t } from "elysia";
import { categoryService } from "@/server/services/category.service";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const categoriesRoutes = new Elysia({ prefix: "/categories" })
  .use(adminProxy)
  .get("/", async () => {
    try {
      const categories = await categoryService.getAll();
      return { success: true, categories };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.CATEGORIES_VIEW) })
  .post("/", async ({ body }) => {
    try {
      const category = await categoryService.create(body);
      return { success: true, category };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    beforeHandle: requirePermission(PERMISSIONS.CATEGORIES_CREATE),
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
  .patch("/reorder", async ({ body }) => {
    try {
      const result = await categoryService.reorder(body.items);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    beforeHandle: requirePermission(PERMISSIONS.CATEGORIES_REORDER),
    body: t.Object({
      items: t.Array(t.Object({
        id: t.String(),
        sortOrder: t.Number(),
      })),
    }),
  })
  .patch("/:id", async ({ params, body }) => {
    try {
      const category = await categoryService.update(params.id, body);
      return { success: true, category };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    beforeHandle: requirePermission(PERMISSIONS.CATEGORIES_UPDATE),
    body: t.Partial(t.Object({
      name: t.String(),
      slug: t.String(),
      description: t.String(),
      icon: t.String(),
      coverImage: t.String(),
      sortOrder: t.Number(),
      isActive: t.Boolean(),
      metaTitle: t.String(),
      metaDescription: t.String(),
    })),
  })
  .delete("/:id", async ({ params }) => {
    try {
      await categoryService.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.CATEGORIES_DELETE) });
