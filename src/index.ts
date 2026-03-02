import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { join } from "path";
import { db } from "@/configs/index.config";
import { sql } from "drizzle-orm";
import { routes } from "@/routes/index.route";
import { getSiteSettings } from "@/services/settings.service";
import { addRequestLog } from "@/services/request-logger.service";

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
  const s = await getSiteSettings();

  html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = s[key] ?? "";
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
    const { seedDefaultRoles } = await import("@/services/role-seeder.service");
    await seedDefaultRoles();

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