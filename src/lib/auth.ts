import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { username } from "better-auth/plugins";
import { db } from "@/server/db";
import * as schema from "@/server/db/schemas/user.schema";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

function getBaseUrl() {
  let url = process.env.APP_BETTER_AUTH_DOMAIN;
  if (!url) return undefined;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    const isDev = url.includes("localhost") || url.includes("127.0.0.1");
    url = `${isDev ? "http://" : "https://"}${url}`;
  }
  return url;
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.userSession,
      account: schema.provider,
      verification: schema.userVerification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      banned: {
        type: "boolean",
        defaultValue: false,
      },
      banReason: {
        type: "string",
      },
    },
  },
  baseURL: getBaseUrl(),
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
      },
      verify: async ({ hash, password }: { hash: string; password: string }) => {
        return bcrypt.compareSync(password, hash);
      },
    },
  },
  plugins: [username()],
});

export async function getServerSession(_force: boolean = false) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return { user: null };
    return { user: session.user as schema.User };
  } catch {
    return { user: null };
  }
}
