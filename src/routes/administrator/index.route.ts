import { Elysia } from "elysia";
import { usersRoutes } from "./users.route";

export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  .use(usersRoutes);
