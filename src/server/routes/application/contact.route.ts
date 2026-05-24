import { Elysia } from "elysia";
import { contactService } from "@/server/services/contact.service";

export const contactPublicRoutes = new Elysia({ prefix: "/contact" })
  .post("/", async ({ body }) => {
    try {
      const contact = await contactService.create(body as any);
      return { success: true, contact: { id: contact.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
