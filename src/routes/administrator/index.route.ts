import { Elysia } from "elysia";
import { usersRoutes } from "./users.route";
import { categoriesRoutes } from "./categories.route";
import { productsRoutes } from "./products.route";
import { databaseRoutes } from "./database.route";
import { settingsRoutes } from "./settings.route";
import { uploadRoutes } from "./upload.route";
import { blogRoutes } from "./blog.route";
import { projectsRoutes } from "./projects.route";
import { servicesRoutes } from "./services.route";
import { licensesRoutes } from "./licenses.route";
import { dashboardRoutes } from "./dashboard.route";
import { contactRoutes } from "./contacts.route";
import { requestLogRoutes } from "./requests.route";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(dashboardRoutes)
  .use(usersRoutes)
  .use(categoriesRoutes)
  .use(productsRoutes)
  .use(databaseRoutes)
  .use(settingsRoutes)
  .use(uploadRoutes)
  .use(blogRoutes)
  .use(projectsRoutes)
  .use(servicesRoutes)
  .use(licensesRoutes)
  .use(contactRoutes)
  .use(requestLogRoutes);
