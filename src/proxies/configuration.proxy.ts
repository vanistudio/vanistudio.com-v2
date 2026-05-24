import { Elysia } from "elysia";
import { configurationService } from "@/server/services/configuration.service";

export const configProxy = new Elysia({ name: "config-proxy" })
  .derive({ as: "global" }, async () => {
    const status = await configurationService.getStatus();
    return { needsSetup: status.needsSetup };
  });

