import { router } from "./t";
import { configurationRouter } from "./configuration/configuration.route";

export const appRouter = router({
  configuration: configurationRouter,
});

export type AppRouter = typeof appRouter;
