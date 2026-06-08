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
    let responseHeaders: Headers | undefined;
    try {
      if (data.identity.includes("@") && user.email) {
        const res = await auth.api.signInEmail({
          body: {
            email: user.email,
            password: data.password,
          },
          returnHeaders: true,
        });
        result = res.response;
        responseHeaders = res.headers;
      } else if (user.username) {
        const res = await auth.api.signInUsername({
          body: {
            username: user.username,
            password: data.password,
          },
          returnHeaders: true,
        });
        result = res.response;
        responseHeaders = res.headers;
      } else {
        throw new Error("Tài khoản hoặc mật khẩu không chính xác");
      }
    } catch {
      throw new Error("Tài khoản hoặc mật khẩu không chính xác");
    }

    if (!result || !result.token) {
      throw new Error("Không thể tạo phiên đăng nhập");
    }

    if (responseHeaders) {
      const cookieJar = await cookies();
      const setCookies = (responseHeaders as any).getSetCookie
        ? (responseHeaders as any).getSetCookie()
        : responseHeaders.get("set-cookie")
        ? [responseHeaders.get("set-cookie")]
        : [];

      for (const cookieStr of setCookies) {
        if (!cookieStr) continue;
        const parts = cookieStr.split(";").map((p: string) => p.trim());
        if (parts.length === 0) continue;
        const [nameValue, ...attrs] = parts;
        const eqIdx = nameValue.indexOf("=");
        if (eqIdx === -1) continue;
        const name = nameValue.slice(0, eqIdx);
        const value = decodeURIComponent(nameValue.slice(eqIdx + 1));

        const opt: any = {};
        for (const attr of attrs) {
          const [attrName, attrVal] = attr.split("=");
          const key = attrName.toLowerCase();
          if (key === "path") {
            opt.path = attrVal;
          } else if (key === "expires") {
            opt.expires = new Date(attrVal);
          } else if (key === "max-age") {
            opt.maxAge = parseInt(attrVal, 10);
          } else if (key === "httponly") {
            opt.httpOnly = true;
          } else if (key === "secure") {
            opt.secure = true;
          } else if (key === "samesite") {
            opt.sameSite = attrVal.toLowerCase() as "lax" | "strict" | "none";
          }
        }
        cookieJar.set(name, value, opt);
      }
    }

    return {
      user: result.user,
      token: result.token,
    };
  }
}

export const authenticationService = new AuthenticationService();
