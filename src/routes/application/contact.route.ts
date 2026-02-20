import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { contacts } from "@/schemas/contact.schema";

export const contactPublicRoutes = new Elysia({ prefix: "/contact" })
  .post("/", async ({ body }) => {
    try {
      const { name, email, subject, message } = body as any;
      if (!name || !email || !message) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Email không hợp lệ");
      }

      if (message.length < 10) {
        throw new Error("Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự)");
      }

      const [contact] = await db.insert(contacts).values({
        name,
        email,
        subject: subject || null,
        message,
      }).returning();

      return { success: true, contact: { id: contact.id } };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
