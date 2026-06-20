import { getWhoisRaw, resolveDns, getSslInfo, getHttpInfo, getIpGeo } from "@/server/io/_others/domain.io";
import { checkUserProfile, checkPlaceDetails, getUserCurrentlyWearingDetails, getUserBadges } from "@/server/io/_others/roblox.io";
import { http } from "@/lib/http";
import { db } from "@/server/db";
import { licenses } from "@/server/db/schemas/license.schema";
import { users } from "@/server/db/schemas/user.schema";
import { products } from "@/server/db/schemas/product.schema";
import { eq, or, sql } from "drizzle-orm";

const UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";


function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }
  return cleaned;
}

export function parseWhois(raw: string) {
  const result = {
    domainName: "",
    registrar: "",
    creationDate: "",
    expiryDate: "",
    updatedDate: "",
    registrantName: "",
    registrantOrganization: "",
    registrantCountry: "",
    registrantEmail: "",
    registrantPhone: "",
    nameServers: [] as string[],
    statuses: [] as string[],
    raw: raw,
    available: false,
  };

  const availablePhrases = [
    "No match for domain",
    "No entries found",
    "NOT FOUND",
    "Not Registered",
    "Domain not found",
    "Status: available",
    "No_Query_Result",
    "Không tìm thấy tên miền",
    "Tên miền chưa đăng ký",
    "No matching record",
    "Object_Not_Found",
    "is available",
  ];
  
  if (availablePhrases.some((phrase) => raw.toLowerCase().includes(phrase.toLowerCase()))) {
    result.available = true;
    return result;
  }

  if (!raw || raw.trim().length < 10) {
    result.available = true;
    return result;
  }

  const lines = raw.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (!result.domainName) {
      const match = line.match(/^(?:domain\s*name|domain):\s*(.+)$/i);
      if (match) result.domainName = match[1].trim().toUpperCase();
    }

    if (!result.registrar) {
      const match = line.match(/^(?:registrar|sponsoring\s*registrar|nhà\s*đăng\s*ký):\s*(.+)$/i);
      if (match) result.registrar = match[1].trim();
    }

    if (!result.registrantName) {
      const match = line.match(/^(?:registrant\s*name|registrant):\s*(.+)$/i);
      if (match) result.registrantName = match[1].trim();
    }

    if (!result.registrantOrganization) {
      const match = line.match(/^(?:registrant\s*organization|registrant\s*org):\s*(.+)$/i);
      if (match) result.registrantOrganization = match[1].trim();
    }

    if (!result.registrantCountry) {
      const match = line.match(/^(?:registrant\s*country):\s*(.+)$/i);
      if (match) result.registrantCountry = match[1].trim();
    }

    if (!result.registrantEmail) {
      const match = line.match(/^(?:registrant\s*email|registrant\s*contact\s*email):\s*(.+)$/i);
      if (match) result.registrantEmail = match[1].trim();
    }

    if (!result.registrantPhone) {
      const match = line.match(/^(?:registrant\s*phone):\s*(.+)$/i);
      if (match) result.registrantPhone = match[1].trim();
    }

    if (!result.creationDate) {
      const match = line.match(/^(?:creation\s*date|created\s*on|created\s*date|registered\s*on|ngày\s*tạo):\s*(.+)$/i);
      if (match) {
        const parsed = parseDate(match[1]);
        if (parsed) result.creationDate = parsed;
      }
    }

    if (!result.expiryDate) {
      const match = line.match(/^(?:registry\s*expiry\s*date|expiration\s*date|expiration\s*on|expiry\s*date|ngày\s*hết\s*hạn):\s*(.+)$/i);
      if (match) {
        const parsed = parseDate(match[1]);
        if (parsed) result.expiryDate = parsed;
      }
    }

    if (!result.updatedDate) {
      const match = line.match(/^(?:updated\s*date|last\s*updated|ngày\s*cập\s*nhật):\s*(.+)$/i);
      if (match) {
        const parsed = parseDate(match[1]);
        if (parsed) result.updatedDate = parsed;
      }
    }

    const nsMatch = line.match(/^(?:name\s*server|nserver|ns):\s*(\S+)/i);
    if (nsMatch) {
      const ns = nsMatch[1].trim().toLowerCase().replace(/\.$/, "");
      if (ns && !result.nameServers.includes(ns)) {
        result.nameServers.push(ns);
      }
    }

    const statusMatch = line.match(/^(?:domain\s*status|status|trạng\s*thái):\s*([^\(]+)/i);
    if (statusMatch) {
      const status = statusMatch[1].trim().toLowerCase();
      if (status && !result.statuses.includes(status)) {
        result.statuses.push(status);
      }
    }
  }

  if (!result.domainName) {
    const match = raw.match(/domain:\s*(\S+)/i) || raw.match(/domain name:\s*(\S+)/i);
    if (match) result.domainName = match[1].trim().toUpperCase();
  }

  return result;
}

export class ToolsService {
  async checkDomain(domain: string) {
    if (!domain) {
      throw new Error("Vui lòng nhập tên miền cần kiểm tra");
    }

    try {
      const [rawWhois, dnsRecords, sslInfo, httpInfo] = await Promise.all([
        getWhoisRaw(domain),
        resolveDns(domain),
        getSslInfo(domain),
        getHttpInfo(domain),
      ]);

      const whoisData = parseWhois(rawWhois);
      
      if (!whoisData.domainName) {
        whoisData.domainName = domain.trim().toUpperCase();
      }

      let geoInfo = null;
      if (dnsRecords.A && dnsRecords.A.length > 0) {
        geoInfo = await getIpGeo(dnsRecords.A[0]);
      }

      return {
        whois: whoisData,
        dns: dnsRecords,
        ssl: sslInfo,
        http: httpInfo,
        geo: geoInfo,
      };
    } catch (err: any) {
      throw new Error(`Kiểm tra thất bại: ${err.message}`);
    }
  }

  async checkLiveUid(uids: string[]) {
    if (!uids?.length) throw new Error("Thiếu UID");

    const limited = uids.slice(0, 50);
    const results = await Promise.all(
      limited.map(async (uid) => {
        try {
          const data = await http.get(`https://graph.facebook.com/${uid}/picture?redirect=false`, {
            headers: { "User-Agent": UA_DESKTOP },
          });
          const imgUrl = data?.data?.url;
          const isLive = !!imgUrl && !imgUrl.includes("static.xx.fbcdn.net") && !imgUrl.includes("rsrc.php");
          return { uid, isLive };
        } catch {
          return { uid, isLive: false };
        }
      })
    );

    return { results };
  }

  async checkFacebookCookieLive(cookie: string): Promise<CookieCheckResult> {
    try {
      const response = await http.get<ArrayBuffer>("https://www.facebook.com/me", {
        responseType: "arraybuffer",
        headers: FB_HEADERS(cookie),
        timeout: 15000,
      });
      const html = Buffer.from(response).toString("utf-8");
      
      const userMatch = html.match(USER_ID_REGEX);
      if (userMatch?.[1]) {
        const id = userMatch[1];
        const nameMatch = html.match(/"NAME":"(.*?)"/);
        let name = nameMatch ? nameMatch[1] : "Unknown";
        try { name = JSON.parse(`"${name}"`); } catch {}

        let avatar: string | undefined;
        const avatarMatch = html.match(/"profile_picture":{"uri":"(.*?)"/);
        if (avatarMatch) {
          avatar = avatarMatch[1].replace(/\\/g, '');
        } else {
          const avatarMatch2 = html.match(/image:\s*"(https:\/\/[^"]+)"/);
          if (avatarMatch2) avatar = avatarMatch2[1].replace(/\\/g, '');
        }

        return {
          status: "live",
          id,
          name,
          avatar
        };
      }
      return { status: "dead" };
    } catch (err: any) {
      return { status: "dead", error: err.message };
    }
  }

  async lookupFacebookId(link: string, cookie?: string): Promise<IdLookupResult | IdLookupError> {
    if (cookie) {
      const fbUrl = link.startsWith("http") ? link : `https://www.facebook.com/${link}`;
      const result = await extractIdViaCookie(fbUrl, cookie);

      if (result) {
        return {
          success: 1,
          id: result.id,
          link: fbUrl,
          share_type: 0,
          name: "",
          code: 0,
          post_id: "",
        };
      }
    }
    return extractIdViaTraodoisub(link);
  }

  async getLinkPreview(url: string) {
    if (!url) {
      return {
        success: false,
        error: "URL is empty",
      };
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TelegramBot; +https://telegram.org)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        return {
          success: true,
          data: {
            title: targetUrl.split("/").pop() || "File Link",
            description: `Tệp tin định dạng ${contentType}`,
            images: [],
            siteName: new URL(targetUrl).hostname,
          },
        };
      }

      const rawHtml = await response.text();
      const html = rawHtml.slice(0, 300000);

      const decodeHtmlEntities = (str: string): string => {
        if (!str) return "";
        return str
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&#39;/g, "'")
          .replace(/&#x27;/g, "'")
          .replace(/&#x2F;/g, "/")
          .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
          .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
      };

      const makeAbsolute = (urlStr: string, base: string) => {
        if (!urlStr) return "";
        try {
          return new URL(urlStr, base).href;
        } catch {
          return urlStr;
        }
      };

      const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      const headHtml = headMatch ? headMatch[1] : html;

      const titleMatch = headHtml.match(/<title>([\s\S]*?)<\/title>/i);
      const pageTitle = titleMatch ? titleMatch[1]?.trim() : "";

      const metaTags: Record<string, string> = {};
      const metaRegex = /<meta\s+([^>]*)\/?>/gi;
      let mMatch;
      while ((mMatch = metaRegex.exec(headHtml)) !== null) {
        const attributes = mMatch[1];
        const nameMatch = attributes.match(/(?:name|property|http-equiv)=["']([^"']+)["']/i);
        const contentMatch = attributes.match(/content=["']([^"']*)["']/i);
        if (nameMatch && contentMatch) {
          metaTags[nameMatch[1].toLowerCase()] = contentMatch[1];
        }
      }

      const ogTitle = metaTags["og:title"] || metaTags["twitter:title"] || pageTitle || "";
      const ogDesc = metaTags["og:description"] || metaTags["twitter:description"] || metaTags["description"] || "";
      const ogImage = metaTags["og:image"] || metaTags["twitter:image"] || metaTags["og:image:url"] || "";
      const ogSiteName = metaTags["og:site_name"] || metaTags["og:site"] || "";

      let finalImage = "";
      if (ogImage) {
        finalImage = makeAbsolute(ogImage, targetUrl);
      } else {
        const iconRegex = /<link\s+[^>]*rel=["'](?:shortcut\s+)?icon["'][^>]*href=["']([^"']+)["']/i;
        const iconMatch = headHtml.match(iconRegex);
        if (iconMatch?.[1]) {
          finalImage = makeAbsolute(iconMatch[1], targetUrl);
        }
      }

      return {
        success: true,
        data: {
          title: decodeHtmlEntities(ogTitle).trim() || "No Title",
          description: decodeHtmlEntities(ogDesc).trim() || "No description provided.",
          images: finalImage ? [finalImage] : [],
          siteName: decodeHtmlEntities(ogSiteName).trim() || new URL(targetUrl).hostname,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
      };
    }
  }

  async checkRobloxUser(userIdOrUsername: string | number) {
    return await checkUserProfile(userIdOrUsername);
  }

  async checkRobloxPlace(placeId: number) {
    return await checkPlaceDetails(placeId);
  }

  async checkRobloxUserCurrentlyWearing(userId: number) {
    return await getUserCurrentlyWearingDetails(userId);
  }

  async checkRobloxUserBadges(userId: number) {
    return await getUserBadges(userId);
  }

  async checkLicense(query: string) {
    if (!query?.trim()) {
      throw new Error("Vui lòng nhập tên miền hoặc địa chỉ IP");
    }

    let cleanedInput = query.trim().toLowerCase();
    // Strip protocol and www.
    cleanedInput = cleanedInput.replace(/^(https?:\/\/)?(www\.)?/, "");
    // Strip trailing slashes or paths
    cleanedInput = cleanedInput.split("/")[0];

    const searchJson = JSON.stringify([cleanedInput]);

    const [license] = await db
      .select({
        id: licenses.id,
        licenseKey: licenses.licenseKey,
        status: licenses.status,
        maxActivations: licenses.maxActivations,
        activationCount: licenses.activationCount,
        allowedDomains: licenses.allowedDomains,
        allowedIps: licenses.allowedIps,
        expiresAt: licenses.expiresAt,
        activatedAt: licenses.activatedAt,
        createdAt: licenses.createdAt,
        productName: products.name,
        userName: users.name,
        userEmail: users.email,
      })
      .from(licenses)
      .innerJoin(products, eq(licenses.productId, products.id))
      .innerJoin(users, eq(licenses.userId, users.id))
      .where(
        or(
          sql`${licenses.allowedDomains} @> ${searchJson}::jsonb`,
          sql`${licenses.allowedIps} @> ${searchJson}::jsonb`
        )
      )
      .limit(1);

    if (!license) {
      throw new Error("Không tìm thấy bản quyền nào được đăng ký cho tên miền hoặc IP này");
    }

    return {
      success: true,
      licenseKey: license.licenseKey,
      status: license.status,
      maxActivations: license.maxActivations,
      activationCount: license.activationCount,
      allowedDomains: license.allowedDomains,
      allowedIps: license.allowedIps,
      expiresAt: license.expiresAt,
      activatedAt: license.activatedAt,
      createdAt: license.createdAt,
      productName: license.productName,
      ownerName: license.userName,
      ownerEmail: license.userEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
      checkedValue: query.trim(),
    };
  }
}

const FB_HEADERS = (cookie: string) => ({
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5',
  'cache-control': 'max-age=0',
  'cookie': cookie,
  'dpr': '1',
  'priority': 'u=0, i',
  'sec-ch-prefers-color-scheme': 'dark',
  'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132", "Google Chrome";v="132"',
  'sec-ch-ua-full-version-list': '"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.197", "Google Chrome";v="132.0.6834.197"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-model': '""',
  'sec-ch-ua-platform': '"Windows"',
  'sec-ch-ua-platform-version': '"19.0.0"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
});

const USER_ID_REGEX = /"shouldUseFXIMProfilePicEditor":false,"userID":"(.*?)"/;
const POST_ID_REGEX = /"post_id":"(.*?)"/;

async function extractIdViaCookie(url: string, cookie: string): Promise<{ status: "success"; id: string; post_id?: string } | null> {
  try {
    const response = await http.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      headers: FB_HEADERS(cookie),
      timeout: 15000,
    });

    const html = Buffer.from(response).toString("utf-8");
    const userMatch = html.match(USER_ID_REGEX);
    if (userMatch?.[1]) {
      return { status: "success", id: userMatch[1] };
    }
    const postMatch = html.match(POST_ID_REGEX);
    if (postMatch?.[1]) {
      return { status: "success", id: postMatch[1], post_id: postMatch[1] };
    }

    return null;
  } catch {
    return null;
  }
}

const TDS_API_URL = "https://id.traodoisub.com/api.php";

const TDS_HEADERS = {
  "accept": "application/json, text/javascript, */*; q=0.01",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  "origin": "https://id.traodoisub.com",
  "referer": "https://id.traodoisub.com/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
  "x-requested-with": "XMLHttpRequest",
};

export interface IdLookupResult {
  success: number;
  id: string;
  link: string;
  share_type: number;
  name: string;
  code: number;
  post_id: string;
}

export interface IdLookupError {
  error: string;
}

async function extractIdViaTraodoisub(link: string): Promise<IdLookupResult | IdLookupError> {
  try {
    const params = new URLSearchParams();
    params.append("link", link);
    const data = await http.post<IdLookupResult>(TDS_API_URL, params, {
      headers: TDS_HEADERS,
      timeout: 10000,
    });
    return data;
  } catch (err: any) {
    return { error: err.message || "Request failed" };
  }
}

export interface CookieCheckResult {
  status: "live" | "dead";
  id?: string;
  name?: string;
  avatar?: string;
  error?: string;
}

export const toolsService = new ToolsService();
