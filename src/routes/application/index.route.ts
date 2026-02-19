import { Elysia } from "elysia";
import { productsPublicRoutes } from "./products.route";
import { projectsPublicRoutes } from "./projects.route";
import { toolsPublicRoutes } from "./tools.route";

export const applicationRoutes = new Elysia({ prefix: "/api/app" })
  .use(productsPublicRoutes)
  .use(projectsPublicRoutes)
  .use(toolsPublicRoutes);
