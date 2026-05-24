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

  async create(data: { name: string; email: string; phone?: string; subject?: string; message: string }) {
    const { name, email, phone, subject, message } = data;
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

    return contactRepository.create({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
    });
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
