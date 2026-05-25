import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkConfiguration } from "@/proxies/configuration.proxy";
export async function proxy(req: NextRequest) {
  if (req.nextUrl.pathname === "/denied") {
    return NextResponse.next();
  }
  
  const configResponse = await checkConfiguration(req);
  if (configResponse && (configResponse.status === 307 || configResponse.status === 308)) {
    return configResponse;
  }
  
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/.*|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|woff|woff2|ttf|css|js|ico|json|gif|webp)).*)",
  ],
};
