import { db } from "@/configs/index.config";
import { contacts } from "@/schemas/contact.schema";
import { eq, desc, sql, like, or } from "drizzle-orm";

export const contactController = {
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

    return {
      contacts: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (!contact) throw new Error("Không tìm thấy tin nhắn");
    return contact;
  },

  async markAsRead(id: string) {
    const [updated] = await db.update(contacts)
      .set({ isRead: true })
      .where(eq(contacts.id, id))
      .returning();
    if (!updated) throw new Error("Không tìm thấy tin nhắn");
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(contacts).where(eq(contacts.id, id)).returning();
    if (!deleted) throw new Error("Không tìm thấy tin nhắn");
    return deleted;
  },

  async getUnreadCount() {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(contacts).where(eq(contacts.isRead, false));
    return Number(result?.count || 0);
  },
};
