import { authenticationRepository } from "@/server/repositories/authentication/authentication.repository";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export class AuthenticationService {
  async login(data: { identity: string; password: string }) {
    const user = await authenticationRepository.findUserByIdentity(data.identity);
    if (!user) {
      throw new Error("Tài khoản hoặc mật khẩu không chính xác");
    }

    if (user.banned) {
      throw new Error(user.banReason || "Tài khoản của bạn đã bị khóa");
    }

    let result;
    try {
      if (data.identity.includes("@") && user.email) {
        result = await auth.api.signInEmail({
          body: {
            email: user.email,
            password: data.password,
          },
        });
      } else if (user.username) {
        result = await auth.api.signInUsername({
          body: {
            username: user.username,
            password: data.password,
          },
        });
      } else {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác");
      }
    } catch {
      throw new Error("Tài khoản hoặc mật khẩu không chính xác");
    }

    if (!result || !result.token) {
      throw new Error("Không thể tạo phiên đăng nhập");
    }

    const cookieJar = await cookies();
    const cookieName = process.env.NODE_ENV === "production"
      ? "__secure-better-auth.session_token"
      : "better-auth.session_token";

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    cookieJar.set(cookieName, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return {
      user: result.user,
      token: result.token,
    };
  }
}

export const authenticationService = new AuthenticationService();
