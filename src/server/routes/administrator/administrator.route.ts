import { router } from "../t";
import { menuRouter } from "./menu.route";
import { databaseRouter } from "./database.route";

export const administratorRouter = router({
  menu: menuRouter,
  database: databaseRouter,
});
