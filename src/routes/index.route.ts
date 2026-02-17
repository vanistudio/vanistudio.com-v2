import { Elysia } from "elysia";
import { authRoutes } from "./authentication/authentication.route";
import { configRoutes } from "./configuration/configuration.route";
import { adminRoutes } from "./administrator/index.route";

export const routes = new Elysia()
  .use(authRoutes)
  .use(configRoutes)
  .use(adminRoutes);
