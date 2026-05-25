import Bowser from "bowser";
import { isbot } from "isbot";

export interface DeviceInfo {
  type: string | null;
  vendor: string | null;
  model: string | null;
  brand: string | null;
}

export interface OSInfo {
  name: string | null;
  version: string | null;
  platform: string | null;
}

export interface BrowserInfo {
  name: string | null;
  version: string | null;
  engine: string | null;
}

export interface DeviceData {
  device: DeviceInfo;
  os: OSInfo;
  browser: BrowserInfo;
  isBot: boolean;
}

export function extractDeviceInfo(userAgent: string | null): DeviceData {
  const isBotDetected = userAgent ? isbot(userAgent) : false;

  if (!userAgent || userAgent.trim() === "") {
    return {
      device: {
        type: null,
        vendor: null,
        model: null,
        brand: null,
      },
      os: {
        name: null,
        version: null,
        platform: null,
      },
      browser: {
        name: null,
        version: null,
        engine: null,
      },
      isBot: isBotDetected,
    };
  }

  try {
    const parser = Bowser.getParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const platform = parser.getPlatform();
    const engine = parser.getEngine();

    return {
      device: {
        type: platform.type || null,
        vendor: platform.vendor || null,
        model: platform.model || null,
        brand: platform.vendor || null,
      },
      os: {
        name: os.name || null,
        version: os.version || null,
        platform: os.name?.toLowerCase().includes("windows") ? "win32" : 
                   os.name?.toLowerCase().includes("mac") ? "darwin" :
                   os.name?.toLowerCase().includes("linux") ? "linux" :
                   os.name?.toLowerCase().includes("android") ? "android" :
                   os.name?.toLowerCase().includes("ios") ? "ios" : null,
      },
      browser: {
        name: browser.name || null,
        version: browser.version || null,
        engine: engine.name || null,
      },
      isBot: isBotDetected,
    };
  } catch {
    return {
      device: {
        type: null,
        vendor: null,
        model: null,
        brand: null,
      },
      os: {
        name: null,
        version: null,
        platform: null,
      },
      browser: {
        name: null,
        version: null,
        engine: null,
      },
      isBot: isBotDetected,
    };
  }
}