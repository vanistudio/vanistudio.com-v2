import { db } from "@/configs/index.config";
import { roles } from "@/schemas/role.schema";
import { users } from "@/schemas/user.schema";
import { eq, ilike, sql } from "drizzle-orm";

export const rolesController = {
  async getAll() {
    const allRoles = await db.select().from(roles).orderBy(roles.createdAt);
    // Đếm số user mỗi role
    const result = [];
    for (const role of allRoles) {
      const [count] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.roleId, role.id));
      result.push({ ...role, userCount: count?.count || 0 });
    }
    return result;
  },

  async getById(id: string) {
    const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!role) throw new Error("Role không tồn tại");
    return role;
  },

  async create(data: { name: string; description?: string; permissions: string[] }) {
    const existing = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, data.name)).limit(1);
    if (existing.length > 0) throw new Error("Tên role đã tồn tại");

    const [role] = await db
      .insert(roles)
      .values({
        name: data.name,
        description: data.description || null,
        permissions: data.permissions,
        isSystem: false,
      })
      .returning();
    return role;
  },

  async update(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const [existing] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!existing) throw new Error("Role không tồn tại");
    if (existing.isSystem && data.name && data.name !== existing.name) {
      throw new Error("Không thể đổi tên role hệ thống");
    }

    if (data.name && data.name !== existing.name) {
      const dup = await db.select({ id: roles.id }).from(roles).where(eq(roles.name, data.name)).limit(1);
      if (dup.length > 0) throw new Error("Tên role đã tồn tại");
    }

    const [role] = await db
      .update(roles)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.permissions !== undefined && { permissions: data.permissions }),
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    return role;
  },

  async delete(id: string) {
    const [existing] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    if (!existing) throw new Error("Role không tồn tại");
    if (existing.isSystem) throw new Error("Không thể xóa role hệ thống");

    // Xóa roleId khỏi users trước
    await db.update(users).set({ roleId: null }).where(eq(users.roleId, id));
    await db.delete(roles).where(eq(roles.id, id));
  },
};
