import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export function parseProxy(proxyStr: string) {
  try {
    let protocol = "socks5";
    let host = "";
    let port = 1080;
    let username = "";
    let password = "";

    if (proxyStr.includes("://")) {
      const url = new URL(proxyStr);
      protocol = url.protocol.replace(":", "");
      host = url.hostname;
      port = parseInt(url.port) || 1080;
      username = url.username;
      password = url.password;
    } else {
      const parts = proxyStr.split(":");
      if (parts.length === 2) {
        host = parts[0];
        port = parseInt(parts[1]);
      } else if (parts.length === 4) {
        host = parts[0];
        port = parseInt(parts[1]);
        username = parts[2];
        password = parts[3];
      }
    }

    return {
      ip: host,
      port: port,
      socksType: (protocol.includes("4") ? 4 : 5) as 4 | 5,
      timeout: 10,
      username: username || undefined,
      password: password || undefined,
    };
  } catch (err) {
    console.error("Failed to parse proxy settings:", err);
    return undefined;
  }
}

export async function checkTelegramProxy(
  proxyStr: string,
  apiId: number,
  apiHash: string
): Promise<{ success: boolean; message: string }> {
  const proxyConfig = parseProxy(proxyStr);
  if (!proxyConfig) {
    return { success: false, message: "Định dạng proxy không đúng" };
  }

  const client = new TelegramClient(
    new StringSession(""),
    apiId,
    apiHash,
    {
      connectionRetries: 1,
      proxy: proxyConfig,
      timeout: 5000,
    }
  );

  try {
    await client.connect();
    await client.disconnect();
    return { success: true, message: "Proxy hoạt động tốt" };
  } catch (err: any) {
    return { success: false, message: `Lỗi kết nối proxy: ${err.message}` };
  }
}
