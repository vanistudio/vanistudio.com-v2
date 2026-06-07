import type { NextRequest } from "next/server";

export interface CreateContextOptions {
  headers: Headers;
}

export const createInnerContext = (opts: CreateContextOptions) => {
  return {
    headers: opts.headers,
  };
};

export const createContext = async (opts: { req: NextRequest }) => {
  return createInnerContext({
    headers: opts.req.headers,
  });
};

export type Context = Awaited<ReturnType<typeof createContext>>;
