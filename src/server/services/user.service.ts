import { userRepository } from "@/server/repositories/user.repository";
import { roleRepository } from "@/server/repositories/role.repository";

export const userService = {
  async getUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100);
    const { data, total } = await userRepository.getAll(options);

    return {
      users: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async toggleActive(userId: string, currentUserId: string) {
    if (userId === currentUserId) throw new Error("Bạn không thể tự vô hiệu hóa tài khoản của chính mình");

    const user = await userRepository.getById(userId);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const updated = await userRepository.update(userId, {
      isActive: !user.isActive,
      updatedAt: new Date(),
    });

    return updated;
  },

  async updateRole(userId: string, data: { roleId?: string; role?: string }, currentUserId: string) {
    if (userId === currentUserId) throw new Error("Không thể đổi role chính mình");

    if (data.roleId && data.roleId !== "none") {
      const role = await roleRepository.getById(data.roleId);
      if (!role) throw new Error("Role không tồn tại");

      return userRepository.update(userId, {
        roleId: data.roleId,
        role: role.name,
        updatedAt: new Date(),
      });
    } else {
      return userRepository.update(userId, {
        roleId: null,
        role: data.role || "user",
        updatedAt: new Date(),
      });
    }
  },

  async deleteUser(userId: string, currentUserId: string) {
    if (userId === currentUserId) throw new Error("Bạn không thể tự xóa tài khoản của chính mình");

    const deleted = await userRepository.delete(userId);
    if (!deleted) throw new Error("Không tìm thấy người dùng");
    return deleted;
  },
};
