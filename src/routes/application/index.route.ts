import { Elysia } from "elysia";
import { productsPublicRoutes } from "./products.route";
import { projectsPublicRoutes } from "./projects.route";

export const applicationRoutes = new Elysia({ prefix: "/api/app" })
  .use(productsPublicRoutes)
  .use(projectsPublicRoutes);
