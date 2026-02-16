import { db } from "@/configs/index.config";
import { users } from "@/schemas/user.schema";
import { githubOAuthService, type GitHubConfig } from "@/services/github.service";
import { googleOAuthService, type GoogleConfig } from "@/services/google.service";
import { eq, and } from "drizzle-orm";
import type { OAuthUserInfo } from "@/services/types";

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
  return await Bun.password.hash(randomPassword);
}
async function findOrCreateOAuthUser(
  provider: "github" | "google",
  userInfo: OAuthUserInfo
) {
  const [existing] = await db
    .select()
    .from(users)
    .where(and(eq(users.provider, provider), eq(users.providerId, userInfo.id)))
    .limit(1);

  if (existing) {
    return { user: existing, isNew: false };
  }

  if (userInfo.email) {
    const [byEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, userInfo.email))
      .limit(1);

    if (byEmail) {
      const [updated] = await db
        .update(users)
        .set({ provider, providerId: userInfo.id, avatarUrl: userInfo.avatar || byEmail.avatarUrl })
        .where(eq(users.id, byEmail.id))
        .returning();
      return { user: updated, isNew: false };
    }
  }
  const passwordHash = await generateRandomPasswordHash();
  const [newUser] = await db
    .insert(users)
    .values({
      email: userInfo.email || `${provider}_${userInfo.id}@noemail.local`,
      passwordHash,
      displayName: userInfo.name,
      avatarUrl: userInfo.avatar,
      provider,
      providerId: userInfo.id,
    })
    .returning();

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
export const authController = {
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
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (existingUsername && existingUsername.id !== userId) {
      throw new Error("Username đã được sử dụng");
    }

    const [updated] = await db
      .update(users)
      .set({
        username: data.username,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    const token = createToken(updated.id, false);
    return { user: updated, token };
  },
  async getMe(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        avatarUrl: users.avatarUrl,
        provider: users.provider,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  },
};
