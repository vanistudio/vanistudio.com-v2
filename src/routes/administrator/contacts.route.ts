import { Elysia } from "elysia";
import { contactController } from "@/controllers/administrator/contact.controller";
import { adminProxy } from "@/proxies/administrator.proxy";

export const contactRoutes = new Elysia({ prefix: "/contacts" })
  .use(adminProxy)
  .get("/", async ({ query }) => {
    try {
      const data = await contactController.getAll({
        page: parseInt(query.page || "1"),
        limit: parseInt(query.limit || "20"),
        search: query.search,
      });
      return { success: true, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/unread-count", async () => {
    try {
      const count = await contactController.getUnreadCount();
      return { success: true, count };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/:id", async ({ params }) => {
    try {
      const contact = await contactController.getById(params.id);
      return { success: true, contact };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .patch("/:id/read", async ({ params }) => {
    try {
      const contact = await contactController.markAsRead(params.id);
      return { success: true, contact };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .delete("/:id", async ({ params }) => {
    try {
      await contactController.delete(params.id);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
