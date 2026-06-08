import { router } from "./t";
import { configurationRouter } from "./configuration/configuration.route";
import { authenticationRouter } from "./authentication/authentication.route";
import { administratorRouter } from "./administrator/administrator.route";

export const appRouter = router({
  configuration: configurationRouter,
  authentication: authenticationRouter,
  administrator: administratorRouter,
});

export type AppRouter = typeof appRouter;
