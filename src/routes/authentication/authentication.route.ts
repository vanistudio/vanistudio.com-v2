import { Elysia, t } from "elysia";
import { authController, verifyToken } from "@/controllers/authentication/authentication.controller";

const COOKIE_NAME = "vani_auth";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60, 
};

export const authRoutes = new Elysia({ prefix: "/api/auth" })
  .get("/github", ({ redirect }) => {
    const url = authController.getGithubAuthUrl();
    return redirect(url);
  })
  .get("/github/callback", async ({ query, cookie, redirect }) => {
    try {
      const code = query.code;
      if (!code) return redirect("/auth/login?error=no_code");

      const { token, needsOnboarding } = await authController.handleGithubCallback(code);
      cookie[COOKIE_NAME].set({ value: token, ...COOKIE_OPTIONS });

      return redirect(needsOnboarding ? "/onboarding" : "/");
    } catch (error) {
      console.error("GitHub callback error:", error);
      return redirect("/auth/login?error=github_failed");
    }
  })
  .get("/google", ({ redirect }) => {
    const url = authController.getGoogleAuthUrl();
    return redirect(url);
  })
  .get("/google/callback", async ({ query, cookie, redirect }) => {
    try {
      const code = query.code;
      if (!code) return redirect("/auth/login?error=no_code");

      const { token, needsOnboarding } = await authController.handleGoogleCallback(code);
      cookie[COOKIE_NAME].set({ value: token, ...COOKIE_OPTIONS });

      return redirect(needsOnboarding ? "/onboarding" : "/");
    } catch (error) {
      console.error("Google callback error:", error);
      return redirect("/auth/login?error=google_failed");
    }
  })
  .get("/me", async ({ cookie }) => {
    const token = cookie[COOKIE_NAME]?.value as string | undefined;
    if (!token) return { success: false, error: "Chưa đăng nhập" };

    const payload = verifyToken(token);
    if (!payload) return { success: false, error: "Token không hợp lệ" };

    const user = await authController.getMe(payload.userId);
    if (!user) return { success: false, error: "Không tìm thấy người dùng" };

    return { success: true, user, needsOnboarding: payload.needsOnboarding };
  })
  .post("/onboarding", async ({ body, cookie }) => {
    const token = cookie[COOKIE_NAME]?.value as string | undefined;
    if (!token) return { success: false, error: "Chưa đăng nhập" };

    const payload = verifyToken(token);
    if (!payload) return { success: false, error: "Token không hợp lệ" };

    try {
      const { user, token: newToken } = await authController.completeOnboarding(payload.userId, body);
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
  .post("/logout", ({ cookie }) => {
    cookie[COOKIE_NAME].set({ value: "", ...COOKIE_OPTIONS, maxAge: 0 });
    return { success: true };
  });
