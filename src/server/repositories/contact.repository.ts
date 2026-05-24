import { db } from "@/server/configs/index.config";
import { contacts } from "@/schemas/contact.schema";
import { eq, desc, sql, like, or } from "drizzle-orm";

export const contactRepository = {
  async getAll(options: { page?: number; limit?: number; search?: string }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const offset = (page - 1) * limit;

    const conditions = [];
    if (options.search) {
      const search = `%${options.search}%`;
      conditions.push(or(like(contacts.name, search), like(contacts.email, search), like(contacts.subject, search)));
    }

    const whereClause = conditions.length ? conditions[0] : undefined;

    const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(whereClause);
    const total = Number(countResult?.count || 0);

    const data = await db.select().from(contacts)
      .where(whereClause)
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  },

  async getById(id: string) {
    const [row] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return row || null;
  },

  async create(data: any) {
    const [row] = await db.insert(contacts).values(data).returning();
    return row;
  },

  async markAsRead(id: string) {
    const [row] = await db.update(contacts).set({ isRead: true }).where(eq(contacts.id, id)).returning();
    return row || null;
  },

  async delete(id: string) {
    const [row] = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    return row || null;
  },

  async getUnreadCount() {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.isRead, false));
    return Number(result?.count || 0);
  },
};
