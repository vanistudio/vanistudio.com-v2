import { router } from "./t";
import { configurationRouter } from "./configuration/configuration.route";
import { authenticationRouter } from "./authentication/authentication.route";
import { administratorRouter } from "./administrator/administrator.route";
import { toolsRouter } from "./public/tools.route";

export const appRouter = router({
  configuration: configurationRouter,
  authentication: authenticationRouter,
  administrator: administratorRouter,
  tools: toolsRouter,
});

export type AppRouter = typeof appRouter;
