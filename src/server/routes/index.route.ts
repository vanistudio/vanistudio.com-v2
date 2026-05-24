import { Elysia } from "elysia";
import { authRoutes } from "./authentication/authentication.route";
import { adminRoutes } from "./administrator/index.route";
import { applicationRoutes } from "./application/index.route";
import { configRoutes } from "./configuration/configuration.route";
import { seoRoutes } from "./seo.route";

export const routes = new Elysia()
  .use(authRoutes)
  .use(adminRoutes)
  .use(applicationRoutes)
  .use(configRoutes)
  .use(seoRoutes);
