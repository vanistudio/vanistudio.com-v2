import { authenticationRepository } from "@/server/repositories/authentication.repository";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { userProfile, generateUserAvatar } from "@/server/db/schemas/user.schema";
import { extensionsRepository } from "@/server/repositories/extensions.repository";

export class AuthenticationService {
  async register(input: any) {
    const ext = await extensionsRepository.getExtensionById("user_registration_customizer");
    const isRegisterEnabled = ext?.isEnabled ?? true;
    if (!isRegisterEnabled) {
      throw new Error("Tính năng đăng ký thành viên hiện đang tạm khóa.");
    }

    const config = (ext?.config as any) || { fields: {} };
    const fields = config.fields || {};

    const keys = [
      "email",
      "name",
      "username",
      "phone",
      "identityCard",
      "taxId",
      "address1",
      "address2",
      "city",
      "district",
      "state",
      "postalCode",
      "country",
    ];

    for (const key of keys) {
      const fieldConfig = fields[key];
      const isShown = fieldConfig?.show ?? (key === "email" || key === "name" || key === "username");
      const isRequired = fieldConfig?.required ?? (key === "email" || key === "name");

      if (isShown && isRequired) {
        const val = input[key];
        if (!val || val.trim() === "") {
          const label = fieldConfig?.label || key;
          throw new Error(`Trường '${label}' là bắt buộc nhập.`);
        }
      }
    }

    const emailVal = input.email?.trim();
    const usernameVal = input.username?.trim();
    const phoneVal = input.phone?.trim();

    const hasEmail = (fields.email?.show ?? true) && emailVal;
    const hasUsername = (fields.username?.show ?? true) && usernameVal;
    const hasPhone = (fields.phone?.show ?? true) && phoneVal;

    if (!hasEmail && !hasUsername && !hasPhone) {
      throw new Error("Vui lòng điền ít nhất một thông tin định danh (Email, Số điện thoại hoặc Tên đăng nhập).");
    }

    if (usernameVal) {
      const uVal = config.usernameValidation || { minLength: 4, maxLength: 20, allowedCharacters: "lowercase_alphanumeric" };
      const minL = uVal.minLength ?? 4;
      const maxL = uVal.maxLength ?? 20;
      if (usernameVal.length < minL) {
        throw new Error(`Tên đăng nhập phải có ít nhất ${minL} ký tự.`);
      }
      if (usernameVal.length > maxL) {
        throw new Error(`Tên đăng nhập không được vượt quá ${maxL} ký tự.`);
      }
      const allowedChars = uVal.allowedCharacters ?? "lowercase_alphanumeric";
      if (allowedChars === "lowercase_alphanumeric") {
        if (!/^[a-z0-9_]+$/.test(usernameVal)) {
          throw new Error("Tên đăng nhập chỉ được chứa các ký tự viết thường (a-z), chữ số (0-9) và dấu gạch dưới (_).");
        }
      } else if (allowedChars === "alphanumeric") {
        if (!/^[a-zA-Z0-9_]+$/.test(usernameVal)) {
          throw new Error("Tên đăng nhập chỉ được chứa chữ cái (a-z, A-Z), chữ số (0-9) và dấu gạch dưới (_).");
        }
      }
    }

    if (emailVal) {
      const eVal = config.emailValidation || { allowedDomains: [] };
      const domain = emailVal.split("@")[1]?.toLowerCase();
      if (domain) {
        const allowed = eVal.allowedDomains || [];
        
        if (allowed.length > 0 && !allowed.some((d: string) => d.toLowerCase() === domain || domain.endsWith("." + d.toLowerCase()))) {
          throw new Error(`Hệ thống chỉ chấp nhận đăng ký với các tên miền email được cho phép.`);
        }
      }
    }

    if (input.password) {
      const pVal = config.passwordValidation || { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecialChar: true };
      const minL = pVal.minLength ?? 8;
      if (input.password.length < minL) {
        throw new Error(`Mật khẩu phải có ít nhất ${minL} ký tự.`);
      }
      if (pVal.requireUppercase && !/[A-Z]/.test(input.password)) {
        throw new Error("Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa.");
      }
      if (pVal.requireLowercase && !/[a-z]/.test(input.password)) {
        throw new Error("Mật khẩu phải chứa ít nhất 1 chữ cái viết thường.");
      }
      if (pVal.requireNumber && !/\d/.test(input.password)) {
        throw new Error("Mật khẩu phải chứa ít nhất 1 chữ số.");
      }
      if (pVal.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(input.password)) {
        throw new Error("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.");
      }
    }

    const name = input.name || "Thành viên";
    const username = (fields.username?.show ?? true) ? usernameVal : undefined;
    
    let email = emailVal;
    if (!(fields.email?.show ?? true) || !emailVal) {
      const uniqueSuffix = Math.random().toString(36).substring(2, 8);
      const identifier = usernameVal || phoneVal || uniqueSuffix;
      email = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, "")}_${uniqueSuffix}@local.vanistudio.com`;
    }

    let result;
    let responseHeaders: Headers | undefined;
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email,
          password: input.password,
          name,
          username,
          image: generateUserAvatar(username || name, email),
        } as any,
        returnHeaders: true,
      });
      result = res.response;
      responseHeaders = res.headers;
    } catch (err: any) {
      throw new Error(err.message || "Tên tài khoản hoặc Email đã tồn tại");
    }

    if (!result || !result.user) {
      throw new Error("Không thể tạo tài khoản mới");
    }

    try {
      await db.insert(userProfile).values({
        userId: result.user.id,
        phone: (fields.phone?.show ?? true) ? input.phone : null,
        identityCard: (fields.identityCard?.show ?? true) ? input.identityCard : null,
        taxId: (fields.taxId?.show ?? true) ? input.taxId : null,
        address1: (fields.address1?.show ?? true) ? input.address1 : null,
        address2: (fields.address2?.show ?? true) ? input.address2 : null,
        city: (fields.city?.show ?? true) ? input.city : null,
        district: (fields.district?.show ?? true) ? input.district : null,
        state: (fields.state?.show ?? true) ? input.state : null,
        postalCode: (fields.postalCode?.show ?? true) ? input.postalCode : null,
        country: (fields.country?.show ?? true) ? input.country : null,
      });
    } catch (err: any) {
      console.error("Error creating user profile:", err);
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

  async login(data: { identity: string; password: string }) {
    const ext = await extensionsRepository.getExtensionById("user_login_customizer");
    const config = ext?.config as any || {};
    const methods = config.allowedMethods || { email: true, phone: true, username: true };
    const isEmail = data.identity.includes("@");
    const isPhone = /^\+?[0-9]{9,15}$/.test(data.identity);
    
    if (isEmail && !methods.email) {
      throw new Error("Đăng nhập bằng địa chỉ Email hiện không được phép.");
    }
    if (isPhone && !methods.phone) {
      throw new Error("Đăng nhập bằng Số điện thoại hiện không được phép.");
    }
    if (!isEmail && !isPhone && !methods.username) {
      throw new Error("Đăng nhập bằng Tên tài khoản hiện không được phép.");
    }

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
      if (user.email) {
        const res = await auth.api.signInEmail({
          body: {
            email: user.email,
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
