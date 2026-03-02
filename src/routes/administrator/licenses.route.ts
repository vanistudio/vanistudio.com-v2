import { Elysia } from "elysia";
import { licensesController } from "@/controllers/administrator/licenses.controller";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

/** Mask license key: chỉ admin (wildcard *) thấy full key */
function maskKey(key: string): string {
  const parts = key.split("-");
  if (parts.length <= 1) return "****";
  const last = parts[parts.length - 1];
  return parts.slice(0, -1).map(() => "XXXX").join("-") + "-" + last;
}

function isFullAdmin(admin: any): boolean {
  return admin?.permissions?.includes("*") === true;
}

export const licensesRoutes = new Elysia({ prefix: "/licenses" })
  .use(adminProxy)
  .get("/", async ({ query, admin }) => {
    try {
      const result = await licensesController.getAll({
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
        search: query.search || undefined,
        status: query.status || undefined,
      });
      if (!isFullAdmin(admin)) {
        result.licenses = result.licenses.map((l: any) => ({ ...l, key: maskKey(l.key) }));
      }
      return { success: true, ...result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_VIEW) })
  .get("/products", async () => {
    try {
      const products = await licensesController.getProducts();
      return { success: true, products };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_VIEW) })
  .get("/users", async () => {
    try {
      const users = await licensesController.getUsers();
      return { success: true, users };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_VIEW) })
  .get("/:id", async ({ params, admin }) => {
    try {
      const license = await licensesController.getById(params.id);
      if (!isFullAdmin(admin)) {
        (license as any).key = maskKey((license as any).key);
      }
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_VIEW) })
  .post("/", async ({ body, admin }) => {
    try {
      const license = await licensesController.create(body as any);
      if (!isFullAdmin(admin)) license.key = maskKey(license.key);
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_CREATE) })
  .patch("/:id", async ({ params, body, admin }) => {
    try {
      const license = await licensesController.update(params.id, body as any);
      if (!isFullAdmin(admin)) (license as any).key = maskKey((license as any).key);
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_UPDATE) })
  .patch("/:id/revoke", async ({ params, admin }) => {
    try {
      const license = await licensesController.revoke(params.id);
      if (!isFullAdmin(admin)) (license as any).key = maskKey((license as any).key);
      return { success: true, license };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_REVOKE) })
  .delete("/:id", async ({ params }) => {
    try {
      await licensesController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.LICENSES_DELETE) });
