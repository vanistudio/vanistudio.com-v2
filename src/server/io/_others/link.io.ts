export interface LinkPreviewResult {
  success: boolean;
  data?: {
    title: string;
    description: string;
    images: string[];
    siteName: string;
  };
  error?: string;
}

export async function getLinkPreview(url: string): Promise<LinkPreviewResult> {
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
