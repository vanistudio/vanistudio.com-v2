import { Elysia } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import cors from "@elysiajs/cors";
import { join } from "path";

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
  .get("/assets/*", ({ path }) => Bun.file(join(process.cwd(), "dist/public", path)))
  .get("/", () => Bun.file(join(process.cwd(), "dist/public/index.html")))
  .get("*", ({ path }) => {
    if (path.startsWith('/api') || path.startsWith('/_vanixjnk')) {
       return;
    }
    if (path.includes('.')) {
        return Bun.file(join(process.cwd(), "dist/public", path));
    }
    return Bun.file(join(process.cwd(), "dist/public/index.html"));
  });
async function startServer() {
  try {
    const envPort = parseInt(process.env.APP_PORT || "3000", 10);
    if (isNaN(envPort) || envPort < 1 || envPort > 65535) {
      console.error("➥ Cổng không hợp lệ trong ENV. Hãy đặt giá trị từ 1 đến 65535.");
      process.exit(1);
    }
    const server = app.listen(envPort);
    console.log(`🦊 Elysia đang chạy tại http://localhost:${envPort}`);
    const gracefulShutdown = async () => {
      console.log("➥ Đang dừng máy chủ...");
      try {
      } catch (error) {
        console.error("➥ Lỗi khi cleanup:", error);
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