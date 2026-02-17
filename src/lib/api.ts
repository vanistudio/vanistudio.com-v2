import { treaty } from "@elysiajs/eden";
import type { App } from "@/index";

export const api = treaty<App>(window.location.origin);