import { router } from "../t";
import { menuRouter } from "./menu.route";

export const administratorRouter = router({
  menu: menuRouter,
});
