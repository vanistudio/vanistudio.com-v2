import { Elysia, t } from "elysia";
import { productsController } from "@/controllers/administrator/products.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const productsRoutes = new Elysia({ prefix: "/products" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const result = await productsController.getAll({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        search: query.search || undefined,
        categoryId: query.categoryId || undefined,
        status: query.status || undefined,
        type: query.type || undefined,
      });
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PRODUCTS_VIEW) })
  .get("/:id", async ({ params }) => {
    try {
      const product = await productsController.getById(params.id);
      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PRODUCTS_VIEW) })
  .post("/", async ({ admin, body }) => {
    try {
      const product = await productsController.create(admin!.userId, body as any);
      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PRODUCTS_CREATE) })
  .patch("/:id", async ({ params, body }) => {
    try {
      const product = await productsController.update(params.id, body as any);
      return { success: true, product };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PRODUCTS_UPDATE) })
  .delete("/:id", async ({ params }) => {
    try {
      await productsController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.PRODUCTS_DELETE) });
