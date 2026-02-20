import { Elysia, t } from "elysia";
import { authController } from "@/controllers/authentication/authentication.controller";
import { authProxy } from "@/proxies/authentication.proxy";
import { configProxy } from "@/proxies/configuration.proxy";

const COOKIE_NAME = "vani_auth";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, 
};

const REDIRECT = {
  home: "/",
  login: "/auth/login",
  onboarding: "/onboarding",
  configuration: "/configuration",
  loginError: (err: string) => `/auth/login?error=${err}`,
};

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .use(authProxy)
  .use(configProxy)
  .get("/github", ({ redirect }) => {
    const url = authController.getGithubAuthUrl();
    return redirect(url);
  })
  .get("/github/callback", async ({ query, cookie, redirect, needsSetup }) => {
    try {
      const code = query.code;
      if (!code) return redirect(REDIRECT.loginError("no_code"));

      const { token, needsOnboarding } = await authController.handleGithubCallback(code);
      cookie[COOKIE_NAME].set({ value: token, ...COOKIE_OPTIONS });

      if (needsSetup) return redirect(REDIRECT.configuration);
      return redirect(needsOnboarding ? REDIRECT.onboarding : REDIRECT.home);
    } catch (error) {
      console.error("GitHub callback error:", error);
      return redirect(REDIRECT.loginError("github_failed"));
    }
  })
  .get("/google", ({ redirect }) => {
    const url = authController.getGoogleAuthUrl();
    return redirect(url);
  })
  .get("/google/callback", async ({ query, cookie, redirect, needsSetup }) => {
    try {
      const code = query.code;
      if (!code) return redirect(REDIRECT.loginError("no_code"));

      const { token, needsOnboarding } = await authController.handleGoogleCallback(code);
      cookie[COOKIE_NAME].set({ value: token, ...COOKIE_OPTIONS });

      if (needsSetup) return redirect(REDIRECT.configuration);
      return redirect(needsOnboarding ? REDIRECT.onboarding : REDIRECT.home);
    } catch (error) {
      console.error("Google callback error:", error);
      return redirect(REDIRECT.loginError("google_failed"));
    }
  })
  .get("/me", async ({ auth }) => {
    if (!auth) return { success: false, error: "Chưa đăng nhập" };

    const user = await authController.getMe(auth.userId);
    if (!user) return { success: false, error: "Không tìm thấy người dùng" };

    return { success: true, user, needsOnboarding: auth.needsOnboarding };
  })
  .post("/onboarding", async ({ body, cookie, auth }) => {
    if (!auth) return { success: false, error: "Chưa đăng nhập" };

    try {
      const { user, token: newToken } = await authController.completeOnboarding(auth.userId, body);
      cookie[COOKIE_NAME].set({ value: newToken, ...COOKIE_OPTIONS });
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3, maxLength: 32 }),
      fullName: t.String({ minLength: 1, maxLength: 100 }),
      phoneNumber: t.String({ minLength: 1, maxLength: 20 }),
    }),
  })
  .post("/register", async ({ body, cookie }) => {
    try {
      const { username, fullName, email, phone, password, confirmPassword } = body as any;
      if (!username || !fullName || !email || !password) {
        return { success: false, error: "Vui lòng điền đầy đủ thông tin" };
      }
      if (password.length < 6) {
        return { success: false, error: "Mật khẩu tối thiểu 6 ký tự" };
      }
      if (password !== confirmPassword) {
        return { success: false, error: "Mật khẩu xác nhận không khớp" };
      }

      const { token } = await authController.register({ username, fullName, email, phone: phone || "", password });
      cookie[COOKIE_NAME].set({ value: token, ...COOKIE_OPTIONS });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/login", async ({ body, cookie }) => {
    try {
      const { email, password } = body as any;
      if (!email || !password) {
        return { success: false, error: "Vui lòng nhập email và mật khẩu" };
      }

      const { token, needsOnboarding } = await authController.login(email, password);
      cookie[COOKIE_NAME].set({ value: token, ...COOKIE_OPTIONS });
      return { success: true, needsOnboarding };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/logout", ({ cookie }) => {
    cookie[COOKIE_NAME].set({ value: "", ...COOKIE_OPTIONS, maxAge: 0 });
    return { success: true };
  });
