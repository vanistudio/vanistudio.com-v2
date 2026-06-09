import { getWhoisRaw, resolveDns, getSslInfo, getHttpInfo, getIpGeo } from "@/server/io/_others/domain.io";
import { http } from "@/lib/http";

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
}

export const toolsService = new ToolsService();
