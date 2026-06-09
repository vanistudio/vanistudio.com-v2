import * as net from "net";
import * as dns from "dns/promises";
import * as tls from "tls";
import * as http from "http";
import * as https from "https";
import { getIPInfo } from "@/server/plugins/ip.plugin";

function querySocket(server: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let data = "";
    
    socket.setTimeout(8000);
    
    socket.connect(43, server, () => {
      socket.write(query + "\r\n");
    });
    
    socket.on("data", (chunk) => {
      data += chunk.toString("utf8");
    });
    
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error(`Timeout querying WHOIS server: ${server}`));
    });
    
    socket.on("error", (err) => {
      socket.destroy();
      reject(err);
    });
    
    socket.on("close", () => {
      resolve(data);
    });
  });
}

function findReferralServer(raw: string): string | null {
  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith("refer:") || trimmed.toLowerCase().startsWith("whois server:")) {
      const parts = trimmed.split(":");
      if (parts.length > 1) {
        const server = parts.slice(1).join(":").trim();
        if (server && server.toLowerCase() !== "whois.iana.org") {
          return server;
        }
      }
    }
    if (trimmed.toLowerCase().startsWith("registrar whois server:")) {
      const parts = trimmed.split(":");
      if (parts.length > 1) {
        return parts.slice(1).join(":").trim();
      }
    }
  }
  
  const matchRefer = raw.match(/refer:\s*(\S+)/i);
  if (matchRefer && matchRefer[1].toLowerCase() !== "whois.iana.org") return matchRefer[1];
  
  const matchWhois = raw.match(/whois\s*server:\s*(\S+)/i);
  if (matchWhois && matchWhois[1].toLowerCase() !== "whois.iana.org") return matchWhois[1];

  return null;
}

export async function getWhoisRaw(domain: string): Promise<string> {
  let hostname = domain.trim().toLowerCase();
  hostname = hostname.replace(/^(https?:\/\/)?(www\.)?/, "");
  hostname = hostname.split("/")[0];
  hostname = hostname.split(":")[0];
  
  if (!hostname) {
    throw new Error("Tên miền không hợp lệ");
  }

  let server = "whois.iana.org";
  let rawResponse = "";
  
  try {
    rawResponse = await querySocket(server, hostname);
  } catch (err: any) {
    const tld = hostname.split(".").pop();
    if (tld === "vn") {
      server = "whois.net.vn";
    } else if (tld === "com" || tld === "net") {
      server = "whois.verisign-grs.com";
    } else {
      throw new Error(`Không thể kết nối đến máy chủ root WHOIS: ${err.message}`);
    }
    rawResponse = await querySocket(server, hostname);
  }

  const refServer = findReferralServer(rawResponse);
  if (refServer && refServer !== server) {
    try {
      const secondaryResponse = await querySocket(refServer, hostname);
      const registrarServer = findReferralServer(secondaryResponse);
      if (registrarServer && registrarServer !== refServer && registrarServer !== server) {
        try {
          const tertiaryResponse = await querySocket(registrarServer, hostname);
          return tertiaryResponse || secondaryResponse || rawResponse;
        } catch {
          return secondaryResponse || rawResponse;
        }
      }
      return secondaryResponse || rawResponse;
    } catch {
      return rawResponse;
    }
  }

  return rawResponse;
}

export interface DnsRecords {
  A: string[];
  AAAA: string[];
  MX: { exchange: string; priority: number }[];
  NS: string[];
  TXT: string[][];
  CNAME: string[];
}

export async function resolveDns(domain: string): Promise<DnsRecords> {
  let hostname = domain.trim().toLowerCase();
  hostname = hostname.replace(/^(https?:\/\/)?(www\.)?/, "");
  hostname = hostname.split("/")[0];
  hostname = hostname.split(":")[0];

  const records: DnsRecords = {
    A: [],
    AAAA: [],
    MX: [],
    NS: [],
    TXT: [],
    CNAME: [],
  };

  const resolver = new dns.Resolver();
  resolver.setServers(["1.1.1.1", "8.8.8.8"]);

  const tryResolve = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch {
      return null;
    }
  };

  const [a, aaaa, mx, ns, txt, cname] = await Promise.all([
    tryResolve(() => resolver.resolve4(hostname)),
    tryResolve(() => resolver.resolve6(hostname)),
    tryResolve(() => resolver.resolveMx(hostname)),
    tryResolve(() => resolver.resolveNs(hostname)),
    tryResolve(() => resolver.resolveTxt(hostname)),
    tryResolve(() => resolver.resolveCname(hostname)),
  ]);

  if (a) records.A = a;
  if (aaaa) records.AAAA = aaaa;
  if (mx) records.MX = mx;
  if (ns) records.NS = ns;
  if (txt) records.TXT = txt;
  if (cname) records.CNAME = cname;

  return records;
}

export interface SslInfo {
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  error?: string;
}

export function getSslInfo(domain: string): Promise<SslInfo> {
  return new Promise((resolve) => {
    let hostname = domain.trim().toLowerCase();
    hostname = hostname.replace(/^(https?:\/\/)?(www\.)?/, "");
    hostname = hostname.split("/")[0];
    hostname = hostname.split(":")[0];

    const socket = tls.connect(
      {
        port: 443,
        host: hostname,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 4000,
      },
      () => {
        const cert = socket.getPeerCertificate(true);
        const authorized = socket.authorized;
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          resolve({
            valid: false,
            issuer: "Không tìm thấy",
            subject: "Không tìm thấy",
            validFrom: "",
            validTo: "",
            daysRemaining: 0,
            error: "Thiết bị không trả về chứng chỉ SSL",
          });
          return;
        }

        const validFrom = cert.valid_from;
        const validTo = cert.valid_to;

        const getStr = (val: string | string[] | undefined): string => {
          if (!val) return "";
          return Array.isArray(val) ? val[0] : val;
        };

        const issuer = typeof cert.issuer === "string" ? cert.issuer : getStr(cert.issuer.CN) || getStr(cert.issuer.O) || "Unknown Issuer";
        const subject = typeof cert.subject === "string" ? cert.subject : getStr(cert.subject.CN) || "Unknown Subject";

        const expiryDate = new Date(validTo);
        const now = new Date();
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        resolve({
          valid: authorized,
          issuer,
          subject,
          validFrom: new Date(validFrom).toISOString(),
          validTo: new Date(validTo).toISOString(),
          daysRemaining,
        });
      }
    );

    socket.on("error", (err) => {
      socket.destroy();
      resolve({
        valid: false,
        issuer: "Không có",
        subject: "Không có",
        validFrom: "",
        validTo: "",
        daysRemaining: 0,
        error: err.message,
      });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        valid: false,
        issuer: "Không có",
        subject: "Không có",
        validFrom: "",
        validTo: "",
        daysRemaining: 0,
        error: "Kết nối SSL quá hạn (Timeout)",
      });
    });
  });
}

export interface HttpInfo {
  status: number;
  server: string;
  redirectUrl?: string;
  xPoweredBy?: string;
  responseTimeMs: number;
}

export function getHttpInfo(domain: string): Promise<HttpInfo> {
  return new Promise((resolve) => {
    let hostname = domain.trim().toLowerCase();
    hostname = hostname.replace(/^(https?:\/\/)?(www\.)?/, "");
    hostname = hostname.split("/")[0];
    hostname = hostname.split(":")[0];

    const start = Date.now();
    
    // Try HTTPS HEAD check
    const req = https.request({
      method: "HEAD",
      hostname: hostname,
      port: 443,
      path: "/",
      timeout: 3000,
      rejectUnauthorized: false,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    }, (res) => {
      const serverHeader = Array.isArray(res.headers.server) ? res.headers.server[0] : res.headers.server || "Unknown";
      const redirectHeader = Array.isArray(res.headers.location) ? res.headers.location[0] : res.headers.location;
      const xpbHeader = Array.isArray(res.headers["x-powered-by"]) ? res.headers["x-powered-by"][0] : res.headers["x-powered-by"];

      resolve({
        status: res.statusCode || 0,
        server: serverHeader,
        redirectUrl: redirectHeader,
        xPoweredBy: xpbHeader,
        responseTimeMs: Date.now() - start,
      });
      req.destroy();
    });

    req.on("error", () => {
      // Fallback HTTP
      const httpReq = http.request({
        method: "HEAD",
        hostname: hostname,
        port: 80,
        path: "/",
        timeout: 3000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      }, (res) => {
        const serverHeader = Array.isArray(res.headers.server) ? res.headers.server[0] : res.headers.server || "Unknown";
        const redirectHeader = Array.isArray(res.headers.location) ? res.headers.location[0] : res.headers.location;
        const xpbHeader = Array.isArray(res.headers["x-powered-by"]) ? res.headers["x-powered-by"][0] : res.headers["x-powered-by"];

        resolve({
          status: res.statusCode || 0,
          server: serverHeader,
          redirectUrl: redirectHeader,
          xPoweredBy: xpbHeader,
          responseTimeMs: Date.now() - start,
        });
        httpReq.destroy();
      });

      httpReq.on("error", () => {
        resolve({
          status: 0,
          server: "Không phản hồi (Offline)",
          responseTimeMs: Date.now() - start,
        });
      });

      httpReq.end();
    });

    req.end();
  });
}

export interface GeoInfo {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  isp: string;
  org: string;
}

export async function getIpGeo(ip: string): Promise<GeoInfo | null> {
  if (!ip) return null;
  try {
    const info = await getIPInfo(ip);
    return {
      country: info.country || "",
      countryCode: info.countryCode || "",
      region: info.region || "",
      city: info.city || "",
      isp: info.isp || "",
      org: info.org || "",
    };
  } catch {
  }
  return null;
}
