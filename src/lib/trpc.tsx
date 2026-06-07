import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routes/r";

export const trpc = createTRPCReact<AppRouter>();
