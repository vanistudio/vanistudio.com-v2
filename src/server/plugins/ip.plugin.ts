import { http } from "@/lib/http";
import { isPrivateIP } from "./ip-extractor.plugin";

export async function getIPInfo(ip: string): Promise<{
  isp?: string;
  org?: string;
  asn?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  lat?: number;
  lon?: number;
}> {
  if (ip === "unknown" || isPrivateIP(ip)) {
    return {};
  }

  const apis = [
    async () => {
      try {
        const data: any = await http.get(
          `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
          { timeout: 5000 }
        );
        if (data.status === "success") {
          return {
            isp: data.isp,
            org: data.org,
            asn: data.as?.replace("AS", ""),
            country: data.country,
            countryCode: data.countryCode,
            region: data.regionName,
            city: data.city,
            timezone: data.timezone,
            lat: data.lat,
            lon: data.lon,
          };
        }
      } catch {}
      return null;
    },
    async () => {
      try {
        const data: any = await http.get(`https://ipinfo.io/${ip}/json`, { timeout: 5000 });
        if (data.ip) {
          const [lat, lon] = data.loc?.split(",").map(Number) || [null, null];
          return {
            isp: data.org,
            org: data.org,
            asn: data.org?.split(" ")[0]?.replace("AS", ""),
            country: data.country,
            countryCode: data.country,
            region: data.region,
            city: data.city,
            timezone: data.timezone,
            lat,
            lon,
          };
        }
      } catch {}
      return null;
    },
    async () => {
      try {
        const data: any = await http.get(`https://ipapi.co/${ip}/json/`, { timeout: 5000 });
        if (data.ip && !data.error) {
          return {
            isp: data.org,
            org: data.org,
            asn: data.asn,
            country: data.country_name,
            countryCode: data.country_code,
            region: data.region,
            city: data.city,
            timezone: data.timezone,
            lat: data.latitude,
            lon: data.longitude,
          };
        }
      } catch {}
      return null;
    },
  ];

  let cumulativeData: Record<string, any> = {};

  for (const apiCall of apis) {
    try {
      const result = await apiCall();
      if (result) {
        Object.keys(result).forEach(key => {
          const value = result[key as keyof typeof result];
          if (value !== undefined && value !== null && !cumulativeData[key]) {
            cumulativeData[key] = value;
          }
        });
        if (cumulativeData.city && cumulativeData.countryCode && cumulativeData.isp) {
           return cumulativeData;
        }
      }
    } catch {
      continue;
    }
  }
  return cumulativeData;
}
