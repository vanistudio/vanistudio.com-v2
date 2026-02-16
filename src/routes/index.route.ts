import { Elysia } from "elysia";
import { authRoutes } from "./authentication/authentication.route";

export const routes = new Elysia()
  .use(authRoutes);
