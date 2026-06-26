import { router } from "../t";
import { telegramRouter } from "./telegram.route";

export const applicationRouter = router({
  telegram: telegramRouter,
});
