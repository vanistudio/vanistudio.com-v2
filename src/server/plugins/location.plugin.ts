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
}

export async function extractLocationInfo(ip: string): Promise<LocationInfo> {
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

