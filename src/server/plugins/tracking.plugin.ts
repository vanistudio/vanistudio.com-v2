import { extractDeviceInfo } from "./device.plugin";
export type { DeviceInfo, OSInfo, BrowserInfo, DeviceData } from "./device.plugin";
export { extractDeviceInfo };

import { getIPInfo } from "./ip.plugin";
import { extractIPAddress, getIPVersion, isPrivateIP } from "./ip-extractor.plugin";
export { extractIPAddress, getIPVersion, getIPInfo, isPrivateIP };

import { extractLocationInfo, generateFingerprint } from "./location.plugin";
export { extractLocationInfo, generateFingerprint };
export type { LocationInfo } from "./location.plugin";

export interface ActivityTrackingData {
  deviceId: string;
  ipAddress: string;
  location: string;
  deviceName: string;
  userAgent: string;
  organization: string;
}

export async function extractActivityTracking(
  headers?: Headers | null
): Promise<ActivityTrackingData> {
  if (!headers) {
    return {
      deviceId: "unknown",
      ipAddress: "",
      location: "",
      deviceName: "",
      userAgent: "",
      organization: "",
    };
  }

  const userAgent = headers.get("user-agent") || "";
  const deviceId = headers.get("x-device-id") || "unknown";
  const ipAddress = extractIPAddress(headers);
  const deviceInfo = extractDeviceInfo(userAgent);

  const ipInfo = await getIPInfo(ipAddress).catch(() => ({ 
    city: "", region: "", country: "", isp: "", org: "", asn: "" 
  }));

  const locationParts = [ipInfo.city, ipInfo.region, ipInfo.country].filter(Boolean);

  return {
    deviceId,
    ipAddress,
    location: locationParts.join(", ") || "",
    deviceName: [
        [deviceInfo.device?.vendor, deviceInfo.device?.model].filter(Boolean).join(" ") || deviceInfo.device?.type,
        [deviceInfo.os?.name, deviceInfo.os?.version].filter(Boolean).join(" "),
        [deviceInfo.browser?.name, deviceInfo.browser?.version].filter(Boolean).join(" "),
    ].filter(Boolean).join(" · ") || "",
    userAgent,
    organization: ipInfo.org || ipInfo.isp || "",
  };
}