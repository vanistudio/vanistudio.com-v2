import { Elysia } from "elysia";
import { adminProxy } from "@/proxies/administrator.proxy";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .use(adminProxy)
  .post("/image", async ({ body }) => {
    try {
      const file = (body as any).file;
      if (!file) throw new Error("Không có file");

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Định dạng file không hỗ trợ. Chấp nhận: JPG, PNG, WebP, SVG, GIF, ICO");
      }

      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error("File quá lớn. Tối đa 50MB");
      }

      const ext = file.name.split(".").pop() || "png";
      const fileName = `${randomUUID()}.${ext}`;
      const filePath = join(UPLOAD_DIR, fileName);

      await Bun.write(filePath, file);

      const url = `/uploads/${fileName}`;
      return { success: true, url, fileName };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
