import { contactRepository } from "@/server/repositories/contact.repository";

export const contactService = {
  async getAll(options: { page?: number; limit?: number; search?: string }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const { data, total } = await contactRepository.getAll(options);

    return {
      contacts: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getById(id: string) {
    const row = await contactRepository.getById(id);
    if (!row) throw new Error("Không tìm thấy tin nhắn");
    return row;
  },

  async create(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    return contactRepository.create(data);
  },

  async markAsRead(id: string) {
    const row = await contactRepository.markAsRead(id);
    if (!row) throw new Error("Không tìm thấy tin nhắn");
    return row;
  },

  async delete(id: string) {
    const row = await contactRepository.delete(id);
    if (!row) throw new Error("Không tìm thấy tin nhắn");
    return row;
  },

  async getUnreadCount() {
    const count = await contactRepository.getUnreadCount();
    return { count };
  },
};
