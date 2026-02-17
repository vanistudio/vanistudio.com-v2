import { Elysia } from "elysia";
import { db } from "@/configs/index.config";
import { users } from "@/schemas/user.schema";
import { eq } from "drizzle-orm";
import { authProxy } from "./authentication.proxy";

export const adminProxy = new Elysia({ name: "admin-proxy" })
  .use(authProxy)
  .derive({ as: "global" }, async ({ auth }) => {
    if (!auth) return { admin: null };

    const [user] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, auth.userId))
      .limit(1);

    if (!user || user.role !== "admin") return { admin: null };

    return { admin: { userId: user.id, role: user.role } };
  })
  .onBeforeHandle(({ admin, set }) => {
    if (!admin) {
      set.status = 403;
      return { success: false, error: "Bạn không có quyền truy cập" };
    }
  });
