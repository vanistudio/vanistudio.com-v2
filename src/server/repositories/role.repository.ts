import { db } from "@/server/configs/index.config";
import { roles } from "@/schemas/role.schema";
import { users } from "@/schemas/user.schema";
import { eq, sql } from "drizzle-orm";

export const roleRepository = {
  async getAll() {
    return db.select().from(roles).orderBy(roles.createdAt);
  },

  async getById(id: string) {
    const [row] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
    return row || null;
  },

  async getByName(name: string) {
    const [row] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    return row || null;
  },

  async getUserCountByRole() {
    const counts = await db
      .select({ roleId: users.roleId, count: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(users.roleId);
    return counts;
  },

  async create(data: any) {
    const [row] = await db.insert(roles).values(data).returning();
    return row;
  },

  async update(id: string, data: any) {
    const [row] = await db.update(roles).set(data).where(eq(roles.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    // Reset users role to user
    await db.update(users).set({ roleId: null, role: "user" }).where(eq(users.roleId, id));
    return db.delete(roles).where(eq(roles.id, id));
  },
};
