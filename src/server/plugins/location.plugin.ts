import { getIPInfo } from "./ip.plugin";
import { isPrivateIP } from "./ip-extractor.plugin";

export interface LocationInfo {
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
}

export async function extractLocationInfo(
  ip: string,
  headers?: Headers | Record<string, string | null>
): Promise<LocationInfo> {
  if (headers) {
    const getHeader = (key: string) => {
      const lowerKey = key.toLowerCase();
      if (headers instanceof Headers) {
        return headers.get(lowerKey) || headers.get(key);
      }
      return headers[lowerKey] ?? headers[key] ?? null;
    };

    const vercelCountry = getHeader("x-vercel-ip-country");
    const vercelCity = getHeader("x-vercel-ip-city");
    if (vercelCountry || vercelCity) {
      return {
        country: vercelCountry || undefined,
        countryCode: vercelCountry || undefined,
        region: getHeader("x-vercel-ip-country-region") || undefined,
        regionName: getHeader("x-vercel-ip-country-region") || undefined,
        city: vercelCity ? decodeURIComponent(vercelCity) : undefined,
        lat: getHeader("x-vercel-ip-latitude") ? Number(getHeader("x-vercel-ip-latitude")) : undefined,
        lon: getHeader("x-vercel-ip-longitude") ? Number(getHeader("x-vercel-ip-longitude")) : undefined,
        timezone: getHeader("x-vercel-ip-timezone") || undefined,
      };
    }

    const cfCountry = getHeader("cf-ipcountry");
    const cfCity = getHeader("cf-ipcity") || getHeader("cf-city");
    if (cfCountry || cfCity) {
      return {
        country: cfCountry || undefined,
        countryCode: cfCountry || undefined,
        region: getHeader("cf-region") || undefined,
        regionName: getHeader("cf-region-name") || undefined,
        city: cfCity ? decodeURIComponent(cfCity) : undefined,
        lat: getHeader("cf-latitude") ? Number(getHeader("cf-latitude")) : undefined,
        lon: getHeader("cf-longitude") ? Number(getHeader("cf-longitude")) : undefined,
        timezone: getHeader("cf-timezone") || undefined,
      };
    }

    const nginxCountry = getHeader("x-geoip-country") || getHeader("x-geoip-country-code");
    const nginxCity = getHeader("x-geoip-city");
    if (nginxCountry || nginxCity) {
      return {
        country: nginxCountry || undefined,
        countryCode: nginxCountry || undefined,
        region: getHeader("x-geoip-region") || getHeader("x-geoip-region-name") || undefined,
        regionName: getHeader("x-geoip-region-name") || undefined,
        city: nginxCity ? decodeURIComponent(nginxCity) : undefined,
        lat: getHeader("x-geoip-latitude") ? Number(getHeader("x-geoip-latitude")) : undefined,
        lon: getHeader("x-geoip-longitude") ? Number(getHeader("x-geoip-longitude")) : undefined,
        timezone: getHeader("x-geoip-timezone") || undefined,
      };
    }
  }

  if (ip === "unknown" || isPrivateIP(ip)) {
    return {};
  }

  try {
    const ipInfo = await getIPInfo(ip);
    
    return {
      country: ipInfo.country,
      countryCode: ipInfo.countryCode,
      region: ipInfo.region,
      regionName: ipInfo.region,
      city: ipInfo.city,
      zip: undefined,
      lat: ipInfo.lat,
      lon: ipInfo.lon,
      timezone: ipInfo.timezone,
      isp: ipInfo.isp,
      org: ipInfo.org,
    };
  } catch (error) {
    console.error("Error extracting location info:", error);
    return {};
  }
}

export function generateFingerprint(userAgent: string | null, headers: Headers | Record<string, string | null>): string {
  const components: string[] = [];
  
  if (userAgent) {
    components.push(userAgent);
  }
  
  const acceptLanguage = headers instanceof Headers 
    ? headers.get("accept-language") 
    : headers["accept-language"] || headers["Accept-Language"];
  if (acceptLanguage) {
    components.push(acceptLanguage.split(",")[0].trim());
  }
  
  const acceptEncoding = headers instanceof Headers 
    ? headers.get("accept-encoding") 
    : headers["accept-encoding"] || headers["Accept-Encoding"];
  if (acceptEncoding) {
    components.push(acceptEncoding.split(",")[0].trim());
  }
  
  const fingerprint = components.join("|");
  
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}
