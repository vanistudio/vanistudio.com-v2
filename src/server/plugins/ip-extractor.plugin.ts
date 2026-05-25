export function extractIPAddress(headers: Headers | Record<string, string | null>): string {
  const proxyHeaderKeys = [
    "cf-connecting-ip",
    "true-client-ip",
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "x-forwarded",
    "forwarded-for",
    "forwarded",
    "x-cluster-client-ip",
    "x-original-forwarded-for",
  ];

  for (const key of proxyHeaderKeys) {
    const value = headers instanceof Headers
      ? headers.get(key)
      : headers[key.toLowerCase()] || headers[key];

    if (value) {
      const ips = value.split(",").map(ip => ip.trim()).filter(ip => ip);

      for (const ip of ips) {
        if (isValidIP(ip) && !isPrivateIP(ip)) {
          return ip;
        }
        if (isValidIP(ip)) {
          return ip;
        }
      }
    }
  }
  return "unknown";
}

export function isValidIP(ip: string): boolean {
  if (!ip || typeof ip !== "string") {
    return false;
  }
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".");
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  return ipv6Regex.test(ip) || ip === "::1" || ip.startsWith("::ffff:");
}

export function isPrivateIP(ip: string): boolean {
  if (!ip || typeof ip !== "string") {
    return true;
  }
  const cleanIP = ip.startsWith("::ffff:") ? ip.substring(7) : ip;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(cleanIP)) {
    const parts = cleanIP.split(".").map(Number);
    if (parts[0] === 127) return true;
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 0 && parts[1] === 0 && parts[2] === 0 && parts[3] === 0) return true;
  }
  if (ip.includes(":")) {
    if (ip === "::1" || ip === "::") return true;
    if (ip.toLowerCase().startsWith("fe80:")) return true;
    if (ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd")) return true;
  }

  return false;
}

export function getIPVersion(ip: string): string {
  if (ip.includes(":") && !ip.startsWith("::ffff:")) {
    return "IPv6";
  }
  return "IPv4";
}
