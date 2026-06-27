import { router } from "../t";
import { telegramRouter } from "./telegram.route";
import { discordRouter } from "./discord.route";

export const applicationRouter = router({
  telegram: telegramRouter,
  discord: discordRouter,
});
