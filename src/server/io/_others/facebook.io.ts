import { http } from "@/lib/http";

export const UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const FB_HEADERS = (cookie: string) => ({
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

export const USER_ID_REGEX = /"shouldUseFXIMProfilePicEditor":false,"userID":"(.*?)"/;
export const POST_ID_REGEX = /"post_id":"(.*?)"/;

export const TDS_API_URL = "https://id.traodoisub.com/api.php";

export const TDS_HEADERS = {
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

export interface CookieCheckResult {
  status: "live" | "dead";
  id?: string;
  name?: string;
  avatar?: string;
  error?: string;
}

export async function extractIdViaCookie(url: string, cookie: string): Promise<{ status: "success"; id: string; post_id?: string } | null> {
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

export async function extractIdViaTraodoisub(link: string): Promise<IdLookupResult | IdLookupError> {
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

export async function checkLiveUid(uids: string[]) {
  if (!uids?.length) throw new Error("Thiếu UID");

  const limited = uids.slice(0, 50);
  const results = await Promise.all(
    limited.map(async (uid) => {
      try {
        const data = await http.get<any>(`https://graph.facebook.com/${uid}/picture?redirect=false`, {
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

export async function checkFacebookCookieLive(cookie: string): Promise<CookieCheckResult> {
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

export async function lookupFacebookId(link: string, cookie?: string): Promise<IdLookupResult | IdLookupError> {
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
