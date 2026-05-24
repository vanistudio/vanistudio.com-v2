import { Elysia } from "elysia";
import { contactService } from "@/server/services/contact.service";
import { adminProxy, requirePermission } from "@/proxies/administrator.proxy";
import { PERMISSIONS } from "@/constants/permissions";

export const contactRoutes = new Elysia({ prefix: "/contacts" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const data = await contactService.getAll({
        page: parseInt(query.page || "1"),
        limit: parseInt(query.limit || "20"),
        search: query.search,
      });
      return { success: true, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.CONTACTS_VIEW) })
  .get("/unread-count", async () => {
    try {
      const { count } = await contactService.getUnreadCount();
      return { success: true, count };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.CONTACTS_VIEW) })
  .get("/:id", async ({ params }) => {
    try {
      const contact = await contactService.getById(params.id);
      return { success: true, contact };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.CONTACTS_VIEW) })
  .patch("/:id/read", async ({ params }) => {
    try {
      const contact = await contactService.markAsRead(params.id);
      return { success: true, contact };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.CONTACTS_READ) })
  .delete("/:id", async ({ params }) => {
    try {
      await contactService.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, { beforeHandle: requirePermission(PERMISSIONS.CONTACTS_DELETE) });
