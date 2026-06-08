import { router } from "./t";
import { configurationRouter } from "./configuration/configuration.route";
import { authenticationRouter } from "./authentication/authentication.route";

export const appRouter = router({
  configuration: configurationRouter,
  authentication: authenticationRouter,
});

export type AppRouter = typeof appRouter;
