import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { join } from "path";
import { db } from "@/server/configs/index.config";
import { sql } from "drizzle-orm";
import { routes } from "@/server/routes/index.route";
import { getSiteSettings } from "@/server/services/setting.service";
import { addRequestLog } from "@/server/services/request-logger.service";

export const systemStatus = {
  startedAt: new Date(),
  onlineUsers: 0,
};
const wsConnections = new Set<unknown>();
function broadcastOnlineCount() {
  const message = JSON.stringify({
    type: "online_count",
    value: systemStatus.onlineUsers,
  });
  wsConnections.forEach((ws: any) => {
    try {
      if (ws.readyState === 1) {
        ws.send(message);
      }
    } catch {
    }
  });
}

async function serveHtml() {
  const htmlPath = join(process.cwd(), "dist/public/index.html");
  const file = Bun.file(htmlPath);

  if (!(await file.exists())) return new Response("Not Found", { status: 404 });

  let html = await file.text();
  const settings = await getSiteSettings();
  const s: Record<string, string> = { ...settings };

  // Google Analytics
  s.siteGoogleAnalyticsScript = s.siteGoogleAnalyticsId ? `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${s.siteGoogleAnalyticsId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${s.siteGoogleAnalyticsId}');
  </script>
  ` : "";

  // Google Tag Manager
  s.siteGoogleTagManagerScript = s.siteGoogleTagManagerId ? `
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${s.siteGoogleTagManagerId}');</script>
  ` : "";

  // Facebook Pixel
  s.siteFacebookPixelScript = s.siteFacebookPixelId ? `
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${s.siteFacebookPixelId}');
    fbq('track', 'PageView');
  </script>
  ` : "";

  html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = s[key] ?? "";
    if (key.endsWith("Script")) {
      return val;
    }
    return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  });

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];
const app = new Elysia()
  .ws("/ws/online", {
    open(ws) {
      wsConnections.add(ws);
      systemStatus.onlineUsers++;
      broadcastOnlineCount();
    },
    close(ws) {
      wsConnections.delete(ws);
      systemStatus.onlineUsers = Math.max(0, systemStatus.onlineUsers - 1);
      broadcastOnlineCount();
    },
  })
  .use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposeHeaders: ["Set-Cookie"],
    })
  )
  .onBeforeHandle(({ store }) => {
    (store as any).__startTime = performance.now();
  })
  .onAfterHandle(({ request, store, set }) => {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/assets") || path.startsWith("/uploads") || path === "/ws/online") return;
    const duration = Math.round(performance.now() - ((store as any).__startTime || 0));
    addRequestLog({
      method: request.method,
      path,
      status: (set as any).status || 200,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip") || "127.0.0.1",
      userAgent: request.headers.get("user-agent")?.substring(0, 150) || "",
      duration,
      timestamp: Date.now(),
    });
  })
  .use(routes)
  .get("/assets/*", ({ path }: { path: string }) => Bun.file(join(process.cwd(), "dist/public", path)))
  .get("/uploads/*", ({ path }: { path: string }) => Bun.file(join(process.cwd(), path)))
  .get("/", () => serveHtml())
  .get("*", ({ path }) => {
    if (path.startsWith('/api') || path.startsWith('/_vanixjnk')) {
       return;
    }
    if (path.includes('.')) {
        return Bun.file(join(process.cwd(), "dist/public", path));
    }
    return serveHtml();
  });

export type App = typeof app;
async function startServer() {
  try {
    const envPort = parseInt(process.env.APP_PORT || "3000", 10);
    if (isNaN(envPort) || envPort < 1 || envPort > 65535) {
      console.error("➥ Cổng không hợp lệ trong ENV. Hãy đặt giá trị từ 1 đến 65535.");
      process.exit(1);
    }
    await db.execute(sql`SELECT 1`);
    console.log("🐘 PostgreSQL đã kết nối thành công!");

    // Seed default roles
    const { roleService } = await import("@/server/services/role.service");
    await roleService.seedDefaultRoles();

    const server = app.listen(envPort);
    console.log(`🦊 Elysia đang chạy tại http://localhost:${envPort}`);
    const gracefulShutdown = async () => {
      console.log("➥ Đang dừng máy chủ...");
      try {
      } catch (_error) {
        console.error("➥ Lỗi khi cleanup:", _error);
      }
      server.stop();
      console.log("➥ Máy chủ đã dừng hoạt động.");
      process.exit(0);
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);

  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === "EADDRINUSE") {
      console.error(`❌ LỖI: Cổng ${process.env.APP_PORT || 3000} đã bị sử dụng!`);
      process.exit(1);
    } else {
      console.error("➥ Lỗi khởi động máy chủ:", err);
      process.exit(1);
    }
  }
}
startServer();