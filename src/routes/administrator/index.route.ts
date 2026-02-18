import { Elysia } from "elysia";
import { usersRoutes } from "./users.route";
import { categoriesRoutes } from "./categories.route";
import { productsRoutes } from "./products.route";
import { databaseRoutes } from "./database.route";
import { settingsRoutes } from "./settings.route";
import { uploadRoutes } from "./upload.route";
import { blogRoutes } from "./blog.route";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(usersRoutes)
  .use(categoriesRoutes)
  .use(productsRoutes)
  .use(databaseRoutes)
  .use(settingsRoutes)
  .use(uploadRoutes)
  .use(blogRoutes);
