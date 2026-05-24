import { roleRepository } from "@/server/repositories/role.repository";

export const roleService = {
  async getAll() {
    const allRoles = await roleRepository.getAll();
    const counts = await roleRepository.getUserCountByRole();
    const countMap = new Map(counts.map((c) => [c.roleId, c.count]));
    return allRoles.map((role) => ({ ...role, userCount: countMap.get(role.id) || 0 }));
  },

  async getById(id: string) {
    const role = await roleRepository.getById(id);
    if (!role) throw new Error("Role không tồn tại");
    return role;
  },

  async create(data: { name: string; description?: string; permissions: string[] }) {
    const existing = await roleRepository.getByName(data.name);
    if (existing) throw new Error("Tên role đã tồn tại");

    return roleRepository.create({
      name: data.name,
      description: data.description || null,
      permissions: data.permissions,
      isSystem: false,
    });
  },

  async update(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    const existing = await roleRepository.getById(id);
    if (!existing) throw new Error("Role không tồn tại");
    if (existing.isSystem && data.name && data.name !== existing.name) {
      throw new Error("Không thể đổi tên role hệ thống");
    }

    if (data.name && data.name !== existing.name) {
      const dup = await roleRepository.getByName(data.name);
      if (dup) throw new Error("Tên role đã tồn tại");
    }

    const updated = await roleRepository.update(id, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.permissions !== undefined && { permissions: data.permissions }),
      updatedAt: new Date(),
    });

    return updated;
  },

  async delete(id: string) {
    const existing = await roleRepository.getById(id);
    if (!existing) throw new Error("Role không tồn tại");
    if (existing.isSystem) throw new Error("Không thể xóa role hệ thống");

    await roleRepository.delete(id);
  },

  async seedDefaultRoles() {
    const existing = await roleRepository.getAll();
    const existingNames = existing.map((r) => r.name);

    if (!existingNames.includes("admin")) {
      await roleRepository.create({
        name: "admin",
        description: "Quản trị viên - Toàn quyền",
        permissions: ["*"],
        isSystem: true,
      });
      console.log("🔐 Tạo role mặc định: admin");
    }

    if (!existingNames.includes("user")) {
      await roleRepository.create({
        name: "user",
        description: "Người dùng thông thường",
        permissions: [],
        isSystem: true,
      });
      console.log("🔐 Tạo role mặc định: user");
    }
  },

  async getAdminRoleId(): Promise<string | null> {
    const role = await roleRepository.getByName("admin");
    return role?.id || null;
  },

  async getUserRoleId(): Promise<string | null> {
    const role = await roleRepository.getByName("user");
    return role?.id || null;
  },
};
