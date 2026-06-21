import { usersRepository, GetUsersParams } from "@/server/repositories/users.repository";
import bcrypt from "bcryptjs";

export class UsersService {
  async getStats(params: GetUsersParams) {
    const result = await usersRepository.getUsersList(params);

    return {
      resultCode: 0,
      message: "Success",
      data: {
        items: result.items,
        stats: result.stats,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      },
    };
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      role?: string;
      banned?: boolean;
      banReason?: string | null;
    },
    currentUserId: string
  ) {
    const existing = await usersRepository.findById(id);
    if (!existing) {
      return { resultCode: -1, message: "Không tìm thấy người dùng này." };
    }

    if (id === currentUserId) {
      if (data.banned === true) {
        return { resultCode: -2, message: "Bạn không thể tự khóa tài khoản của chính mình." };
      }
      if (data.role && data.role !== existing.role) {
        return { resultCode: -3, message: "Bạn không thể tự thay đổi vai trò của chính mình." };
      }
    }

    const updated = await usersRepository.updateUser(id, {
      name: data.name,
      role: data.role,
      banned: data.banned,
      banReason: data.banned ? data.banReason : null,
    });

    return {
      resultCode: 0,
      message: "Cập nhật thông tin người dùng thành công.",
      data: updated,
    };
  }

  async deleteUser(id: string, currentUserId: string) {
    const existing = await usersRepository.findById(id);
    if (!existing) {
      return { resultCode: -1, message: "Không tìm thấy người dùng này." };
    }

    if (id === currentUserId) {
      return { resultCode: -2, message: "Bạn không thể tự xóa tài khoản của chính mình." };
    }

    const deleted = await usersRepository.deleteUser(id);
    return {
      resultCode: 0,
      message: "Đã xóa người dùng thành công.",
      data: deleted,
    };
  }

  async getUserFullDetails(id: string) {
    const data = await usersRepository.getUserFullDetails(id);
    if (!data) {
      return { resultCode: -1, message: "Không tìm thấy người dùng." };
    }
    return {
      resultCode: 0,
      message: "Success",
      data,
    };
  }

  async updateUserFullDetails(
    id: string,
    data: {
      user: {
        name?: string;
        username?: string | null;
        role?: string;
        banned?: boolean;
        banReason?: string | null;
        emailVerified?: boolean;
        image?: string | null;
      };
      profile: {
        phone?: string | null;
        address1?: string | null;
        address2?: string | null;
        city?: string | null;
        district?: string | null;
        state?: string | null;
        postalCode?: string | null;
        country?: string | null;
        identityCard?: string | null;
        taxId?: string | null;
      };
    },
    currentUserId: string
  ) {
    const existing = await usersRepository.findById(id);
    if (!existing) {
      return { resultCode: -1, message: "Không tìm thấy người dùng này." };
    }

    if (id === currentUserId) {
      if (data.user.banned === true) {
        return { resultCode: -2, message: "Bạn không thể tự khóa tài khoản của chính mình." };
      }
      if (data.user.role && data.user.role !== existing.role) {
        return { resultCode: -3, message: "Bạn không thể tự thay đổi vai trò của chính mình." };
      }
    }

    const result = await usersRepository.updateUserFullDetails(
      id,
      {
        name: data.user.name,
        username: data.user.username,
        role: data.user.role,
        banned: data.user.banned,
        banReason: data.user.banned ? data.user.banReason : null,
        emailVerified: data.user.emailVerified,
        image: data.user.image,
      },
      data.profile
    );

    return {
      resultCode: 0,
      message: "Cập nhật chi tiết thông tin người dùng thành công.",
      data: result,
    };
  }

  async revokeSession(sessionId: string, userId: string) {
    const result = await usersRepository.revokeSession(sessionId, userId);
    if (!result) {
      return { resultCode: -1, message: "Không tìm thấy phiên đăng nhập hoặc phiên đã hết hạn." };
    }
    return {
      resultCode: 0,
      message: "Đã thu hồi phiên đăng nhập thành công.",
      data: result,
    };
  }

  async resetPassword(userId: string, newPassword: string) {
    const existing = await usersRepository.findById(userId);
    if (!existing) {
      return { resultCode: -1, message: "Không tìm thấy người dùng này." };
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    const result = await usersRepository.resetPassword(userId, passwordHash);

    return {
      resultCode: 0,
      message: "Đặt lại mật khẩu cho thành viên thành công.",
      data: result,
    };
  }
}

export const usersService = new UsersService();
