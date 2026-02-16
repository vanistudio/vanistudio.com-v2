import { Elysia } from "elysia";
import { verifyToken } from "@/controllers/authentication/authentication.controller";

const COOKIE_NAME = "vani_auth";

export const authProxy = new Elysia({ name: "auth-proxy" })
  .derive({ as: "global" }, ({ cookie }) => {
    const token = cookie[COOKIE_NAME]?.value as string | undefined;
    if (!token) return { auth: null };
    const payload = verifyToken(token);
    if (!payload) return { auth: null };
    return { auth: { userId: payload.userId, needsOnboarding: payload.needsOnboarding } };
  });
