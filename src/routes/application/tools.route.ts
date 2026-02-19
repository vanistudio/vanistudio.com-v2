import { Elysia } from "elysia";
import { resolve } from "dns/promises";
import * as tls from "tls";
import ky from "ky";

const UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const UA_MOBILE = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1";

export const toolsPublicRoutes = new Elysia({ prefix: "/tools" })
  .get("/check-id", async ({ query }) => {
    try {
      const target = query.target;
      if (!target) return { success: false, error: "Thiếu target" };

      const BAD_NAMES = ['error', 'facebook', 'page not found', 'content not found', 'log in', 'đăng nhập', 'sign up', 'đăng ký'];
      function cleanName(raw?: string) {
        if (!raw) return undefined;
        const cleaned = raw.replace(/ \| Facebook$/, '').replace(/ - Facebook$/, '').replace(/ \| Фейсбук$/, '').trim();
        if (!cleaned) return undefined;
        const lower = cleaned.toLowerCase();
        if (BAD_NAMES.some(bad => lower.includes(bad))) return undefined;
        return cleaned;
      }

      if (/^\d{5,}$/.test(target)) {
        let name: string | undefined;
        try {
          const html = await ky.get(`https://mbasic.facebook.com/profile.php?id=${target}`, {
            headers: { "User-Agent": UA_MOBILE, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" },
            redirect: "follow",
            throwHttpErrors: false,
          }).text();
          const nameMatch = html.match(/<title>([^<]+)<\/title>/);
          name = cleanName(nameMatch?.[1]);
        } catch {}
        return { success: true, uid: target, name, avatar: `http://graph.facebook.com/${target}/picture?type=large` };
      }
      try {
        const graphData = await ky.get(`https://graph.facebook.com/${target}/picture?redirect=false`, {
          headers: { "User-Agent": UA_DESKTOP },
          throwHttpErrors: false,
        }).json<any>();
        if (graphData?.data?.url) {
          const uidMatch = graphData.data.url.match(/\/(\d{5,})_/);
          if (uidMatch?.[1]) {
            const uid = uidMatch[1];
            return { success: true, uid, avatar: `http://graph.facebook.com/${uid}/picture?type=large` };
          }
        }
      } catch {}
      try {
        const mobileHtml = await ky.get(`https://m.facebook.com/${target}`, {
          headers: { "User-Agent": UA_MOBILE, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" },
          redirect: "follow",
          throwHttpErrors: false,
        }).text();
        const mobilePatterns = [
          /\/profile\/timeline\/stream\/\?profile_id=(\d+)/,
          /owner_id=(\d+)/,
          /\"userID\":\"(\d+)\"/,
          /content=\"fb:\/\/profile\/(\d+)\"/,
          /fb:\/\/profile\/(\d+)/,
          /\"entity_id\":\"(\d+)\"/,
          /\"actorID\":\"(\d+)\"/,
          /subject_id=(\d+)/,
          /\"profileID\":\"(\d+)\"/,
          /page_id=(\d+)/,
        ];
        for (const pattern of mobilePatterns) {
          const match = mobileHtml.match(pattern);
          if (match?.[1] && match[1].length >= 5) {
            const nameMatch = mobileHtml.match(/<title>([^<]+)<\/title>/);
            const name = cleanName(nameMatch?.[1]);
            return { success: true, uid: match[1], name, avatar: `http://graph.facebook.com/${match[1]}/picture?type=large` };
          }
        }
      } catch {}
      try {
        const html = await ky.get(`https://www.facebook.com/${target}`, {
          headers: { "User-Agent": UA_DESKTOP, "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9" },
          redirect: "follow",
          throwHttpErrors: false,
        }).text();
        const patterns = [
          /\"userID\":\"(\d+)\"/,
          /\"entity_id\":\"(\d+)\"/,
          /\"ownerID\":\"(\d+)\"/,
          /\"profileID\":\"(\d+)\"/,
          /\"actorID\":\"(\d+)\"/,
          /fb:\/\/profile\/(\d+)/,
          /content="fb:\/\/profile\/(\d+)"/,
          /\"identifier\":\"(\d+)\"/,
          /\"id\":\"(\d{5,})\"/,
          /profile_id=(\d+)/,
        ];
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match?.[1] && match[1].length >= 5) {
            const nameMatch = html.match(/<title>([^<]+)<\/title>/);
            const name = cleanName(nameMatch?.[1]);
            return { success: true, uid: match[1], name, avatar: `http://graph.facebook.com/${match[1]}/picture?type=large` };
          }
        }
      } catch {}
      return { success: false, error: "Không tìm thấy UID. Hãy kiểm tra lại link hoặc username." };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .post("/check-live-uid", async ({ body }) => {
    try {
      const { uids } = body as { uids: string[] };
      if (!uids?.length) return { success: false, error: "Thiếu UID" };

      const limited = uids.slice(0, 50);
      const results = await Promise.all(
        limited.map(async (uid) => {
          try {
            const data = await ky.get(`https://graph.facebook.com/${uid}/picture?redirect=false`, {
              headers: { "User-Agent": UA_DESKTOP },
              throwHttpErrors: false,
            }).json<any>();
            const isLive = !!(data?.data?.url);
            return { uid, isLive };
          } catch {
            return { uid, isLive: false };
          }
        })
      );

      return { success: true, results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  })
  .get("/check-domain", async ({ query }) => {
    try {
      const domain = query.domain;
      if (!domain) return { success: false, error: "Thiếu domain" };

      const result: any = { domain, available: true, dns: {} };
      try {
        const records = await resolve(domain, "A");
        if (records.length) {
          result.dns.A = records;
          result.available = false;
        }
      } catch {}
      try { result.dns.AAAA = await resolve(domain, "AAAA"); } catch {}
      try { result.dns.NS = await resolve(domain, "NS"); result.available = false; } catch {}
      try {
        const mx = await resolve(domain, "MX") as any;
        result.dns.MX = mx;
      } catch {}
      try { result.dns.TXT = await resolve(domain, "TXT").then(r => r.map((t: any) => Array.isArray(t) ? t.join('') : t)); } catch {}
      try { result.dns.CNAME = await resolve(domain, "CNAME"); } catch {}
      if (!result.available) {
        try {
          const httpRes = await ky.head(`https://${domain}`, {
            headers: { "User-Agent": "VaniStudio-DomainChecker/1.0" },
            redirect: "follow",
            throwHttpErrors: false,
          });
          result.statusCode = httpRes.status;
          result.server = httpRes.headers.get("server") || undefined;
        } catch {
          try {
            const httpRes = await ky.head(`http://${domain}`, {
              headers: { "User-Agent": "VaniStudio-DomainChecker/1.0" },
              redirect: "follow",
              throwHttpErrors: false,
            });
            result.statusCode = httpRes.status;
            result.server = httpRes.headers.get("server") || undefined;
          } catch {}
        }
        try {
          const sslInfo = await new Promise<any>((res, rej) => {
            const socket = tls.connect(443, domain, { servername: domain }, () => {
              const cert = (socket as any).getPeerCertificate();
              socket.end();
              if (!cert?.valid_from) return rej(new Error("No cert"));
              const validTo = new Date(cert.valid_to);
              const daysLeft = Math.ceil((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              res({
                issuer: cert.issuer?.O || cert.issuer?.CN || undefined,
                validFrom: cert.valid_from,
                validTo: cert.valid_to,
                daysLeft,
              });
            });
            socket.on("error", rej);
            socket.setTimeout(5000, () => { socket.destroy(); rej(new Error("Timeout")); });
          });
          result.ssl = sslInfo;
        } catch {}
      }
      return { success: true, result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
