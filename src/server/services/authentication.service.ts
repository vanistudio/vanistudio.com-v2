import { userRepository } from "@/server/repositories/user.repository";
import { roleRepository } from "@/server/repositories/role.repository";
import { githubOAuthService, type GitHubConfig } from "./github.service";
import { googleOAuthService, type GoogleConfig } from "./google.service";
import type { OAuthUserInfo } from "./types";

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signJwt(payload: Record<string, unknown>, secret: string, expiresInMs = 7 * 24 * 60 * 60 * 1000): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + Math.floor(expiresInMs / 1000) };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const hmac = new Bun.CryptoHasher("sha256", key);
  hmac.update(data);
  const signature = base64url(String.fromCharCode(...new Uint8Array(hmac.digest())));

  return `${data}.${signature}`;
}

function verifyJwt(token: string, secret: string): Record<string, unknown> | null {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const data = `${headerB64}.${payloadB64}`;
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const hmac = new Bun.CryptoHasher("sha256", key);
    hmac.update(data);
    const expectedSignature = base64url(String.fromCharCode(...new Uint8Array(hmac.digest())));

    if (signatureB64 !== expectedSignature) return null;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

function getGithubConfig(): GitHubConfig {
  return {
    clientId: process.env.APP_GITHUB_CLIENT_ID || "",
    clientSecret: process.env.APP_GITHUB_CLIENT_SECRET || "",
    redirectUri: process.env.APP_GITHUB_REDIRECT_URI || "",
  };
}

function getGoogleConfig(): GoogleConfig {
  return {
    clientId: process.env.APP_GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.APP_GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.APP_GOOGLE_REDIRECT_URI || "",
  };
}

function getJwtSecret(): string {
  const secret = process.env.APP_JWT_SECRET;
  if (!secret) throw new Error("APP_JWT_SECRET is not defined");
  return secret;
}

async function generateRandomPasswordHash(): Promise<string> {
  const randomPassword = crypto.randomUUID() + crypto.randomUUID();
  return await Bun.password.hash(randomPassword, { algorithm: "bcrypt", cost: 10 });
}

async function findOrCreateOAuthUser(
  provider: "github" | "google",
  userInfo: OAuthUserInfo
) {
  const existing = await userRepository.getByProvider(provider, userInfo.id);

  if (existing) {
    return { user: existing, isNew: false };
  }

  if (userInfo.email) {
    const byEmail = await userRepository.getByEmail(userInfo.email);

    if (byEmail) {
      const updated = await userRepository.update(byEmail.id, {
        provider,
        providerId: userInfo.id,
        avatarUrl: userInfo.avatar || byEmail.avatarUrl,
      });
      return { user: updated, isNew: false };
    }
  }

  const passwordHash = await generateRandomPasswordHash();
  let userRoleId: string | null = null;
  const defaultRole = await roleRepository.getByName("user");
  if (defaultRole) userRoleId = defaultRole.id;

  const newUser = await userRepository.create({
    email: userInfo.email || `${provider}_${userInfo.id}@noemail.local`,
    passwordHash,
    displayName: userInfo.name,
    avatarUrl: userInfo.avatar,
    provider,
    providerId: userInfo.id,
    roleId: userRoleId,
  });

  return { user: newUser, isNew: true };
}

function createToken(userId: string, needsOnboarding: boolean): string {
  return signJwt({ userId, needsOnboarding }, getJwtSecret());
}

export function verifyToken(token: string): { userId: string; needsOnboarding: boolean } | null {
  const payload = verifyJwt(token, getJwtSecret());
  if (!payload || !payload.userId) return null;
  return { userId: payload.userId as string, needsOnboarding: !!payload.needsOnboarding };
}

export const authenticationService = {
  getGithubAuthUrl() {
    const config = getGithubConfig();
    return githubOAuthService.getAuthUrl(config);
  },

  async handleGithubCallback(code: string) {
    const config = getGithubConfig();
    const userInfo = await githubOAuthService.getUserInfo(code, config);
    const { user, isNew } = await findOrCreateOAuthUser("github", userInfo);
    const needsOnboarding = isNew || !user.username;
    const token = createToken(user.id, needsOnboarding);
    return { token, needsOnboarding };
  },

  getGoogleAuthUrl() {
    const config = getGoogleConfig();
    return googleOAuthService.getAuthUrl(config);
  },

  async handleGoogleCallback(code: string) {
    const config = getGoogleConfig();
    const userInfo = await googleOAuthService.getUserInfo(code, config);
    const { user, isNew } = await findOrCreateOAuthUser("google", userInfo);
    const needsOnboarding = isNew || !user.username;
    const token = createToken(user.id, needsOnboarding);
    return { token, needsOnboarding };
  },

  async completeOnboarding(userId: string, data: { username: string; fullName: string; phoneNumber: string }) {
    const existingUsername = await userRepository.getByUsername(data.username);

    if (existingUsername && existingUsername.id !== userId) {
      throw new Error("Username đã được sử dụng");
    }

    const updated = await userRepository.update(userId, {
      username: data.username,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      updatedAt: new Date(),
    });
    const token = createToken(updated.id, false);
    return { user: updated, token };
  },

  async register(data: { username: string; fullName: string; email: string; phone: string; password: string }) {
    const existingEmail = await userRepository.getByEmail(data.email);
    if (existingEmail) throw new Error("Email đã được sử dụng");

    const existingUsername = await userRepository.getByUsername(data.username);
    if (existingUsername) throw new Error("Username đã được sử dụng");

    const passwordHash = await Bun.password.hash(data.password, { algorithm: "bcrypt", cost: 10 });

    let userRoleId: string | null = null;
    const defaultRole = await roleRepository.getByName("user");
    if (defaultRole) userRoleId = defaultRole.id;

    const newUser = await userRepository.create({
      username: data.username,
      email: data.email,
      passwordHash,
      displayName: data.fullName,
      fullName: data.fullName,
      phoneNumber: data.phone,
      provider: "local",
      roleId: userRoleId,
    });

    const token = createToken(newUser.id, false);
    return { token, user: newUser };
  },

  async login(email: string, password: string) {
    const user = await userRepository.getByEmail(email);
    if (!user) throw new Error("Email hoặc mật khẩu không đúng");

    if (user.provider !== "local") {
      throw new Error(`Tài khoản này được đăng nhập qua ${user.provider === "github" ? "GitHub" : "Google"}`);
    }

    if (!user.isActive) throw new Error("Tài khoản đã bị vô hiệu hóa");

    const valid = await Bun.password.verify(password, user.passwordHash);
    if (!valid) throw new Error("Email hoặc mật khẩu không đúng");

    const needsOnboarding = !user.username;
    const token = createToken(user.id, needsOnboarding);
    return { token, needsOnboarding };
  },

  async getMe(userId: string) {
    const user = await userRepository.getByIdForMe(userId);
    if (!user) return null;

    let permissions: string[] = [];
    if (user.roleId) {
      const role = await roleRepository.getById(user.roleId);
      if (role) permissions = role.permissions;
    }
    if (!user.roleId && user.role === "admin") {
      permissions = ["*"];
    }

    return { ...user, permissions };
  },
};
