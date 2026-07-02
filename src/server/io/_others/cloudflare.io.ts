import { createHttpInstance } from "@/lib/http";

const CF_API_BASE = "https://api.cloudflare.com/client/v4";

export interface CloudflareCredentials {
  zoneId: string;
  email: string;
  globalApiKey: string;
}

export interface CloudflareApiResponse<T = any> {
  success: boolean;
  errors: { code: number; message: string }[];
  messages: string[];
  result: T;
}

export interface WafRuleDefinition {
  description: string;
  expression: string;
  action: "block" | "challenge" | "managed_challenge" | "js_challenge" | "skip";
  action_parameters?: Record<string, any>;
  enabled: boolean;
  priority?: number;
}

export interface DeployResult {
  success: boolean;
  rulesDeployed: number;
  ruleResults: {
    name: string;
    success: boolean;
    error?: string;
  }[];
  settingsApplied: {
    name: string;
    success: boolean;
    error?: string;
  }[];
}

function createCfClient(credentials: CloudflareCredentials) {
  return createHttpInstance({
    baseURL: `${CF_API_BASE}/zones/${credentials.zoneId}`,
    defaultOptions: {
      timeout: 15000,
      retry: 1,
      headers: {
        "X-Auth-Email": credentials.email,
        "X-Auth-Key": credentials.globalApiKey,
        "Content-Type": "application/json",
      },
    },
  });
}

async function cfFetch<T = any>(
  credentials: CloudflareCredentials,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: any
): Promise<CloudflareApiResponse<T>> {
  const client = createCfClient(credentials);

  try {
    switch (method) {
      case "POST":
        return await client.post<CloudflareApiResponse<T>>(endpoint, body);
      case "PUT":
        return await client.put<CloudflareApiResponse<T>>(endpoint, body);
      case "PATCH":
        return await client.patch<CloudflareApiResponse<T>>(endpoint, body);
      case "DELETE":
        return await client.delete<CloudflareApiResponse<T>>(endpoint);
      default:
        return await client.get<CloudflareApiResponse<T>>(endpoint);
    }
  } catch (err: any) {
    if (err.data && typeof err.data === "object" && "success" in err.data) {
      return err.data as CloudflareApiResponse<T>;
    }
    return {
      success: false,
      errors: [{ code: err.status || 0, message: err.message || String(err) }],
      messages: [],
      result: null as any,
    };
  }
}

const RULE_1_BYPASS: WafRuleDefinition = {
  description: "[Anti-DDoS] Rule 1: Bypass — White-list Bot SEO, API, Webhook, Static Files",
  action: "skip",
  action_parameters: {
    ruleset: "current",
  },
  enabled: true,
  expression: [
    `(cf.client.bot)`,
    `(http.request.uri.path.extension in {"css" "js" "jpg" "jpeg" "png" "gif" "ico" "svg" "webp" "avif" "woff" "woff2" "ttf" "eot" "otf" "mp4" "webm" "ogg" "mp3" "wav" "pdf" "zip" "gz" "br" "map" "json" "xml" "txt" "robots.txt"})`,
    `(any(lower(http.request.headers.names[*])[*] contains "authorization"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-api-key"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-webhook-signature"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-signature"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-stripe-signature"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-shopify-hmac-sha256"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-github-event"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-hub-signature-256"))`,
    `(any(lower(http.request.headers.names[*])[*] contains "x-app-platform"))`,
    `(http.user_agent contains "Stripe" or http.user_agent contains "facebookexternalhit" or http.user_agent contains "Facebot" or http.user_agent contains "GitHub-Hookshot" or http.user_agent contains "PayPalIPN" or http.user_agent contains "TelegramBot" or http.user_agent contains "Slackbot" or http.user_agent contains "Twitterbot" or http.user_agent contains "LinkedInBot" or http.user_agent contains "Discordbot" or http.user_agent contains "WhatsApp" or http.user_agent contains "UptimeRobot" or http.user_agent contains "BetterStack" or http.user_agent contains "Pingdom" or http.user_agent contains "StatusCake" or http.user_agent contains "MoMo" or http.user_agent contains "Zalo" or http.user_agent contains "VNPAY" or http.user_agent contains "ZaloPay")`,
  ].join(" or "),
};

const RULE_2_BLOCK: WafRuleDefinition = {
  description: "[Anti-DDoS] Rule 2: Block — Botnet thô sơ, giao thức lỗi thời, tool scan",
  action: "block",
  enabled: true,
  expression: [
    `(not cf.client.bot)`,
    `(not any(lower(http.request.headers.names[*])[*] contains "authorization"))`,
    `(not any(lower(http.request.headers.names[*])[*] contains "x-api-key"))`,
  ].join(" and ") + ` and ((http.request.version eq "HTTP/1.0") or (http.user_agent eq "") or (len(http.user_agent) lt 10) or (len(http.user_agent) gt 500) or (http.user_agent contains "curl" and not http.request.uri.path contains "/api/") or (http.user_agent contains "python" and not http.request.uri.path contains "/api/") or (http.user_agent contains "python-requests") or (http.user_agent contains "python-urllib") or (http.user_agent contains "go-http" and not http.request.uri.path contains "/api/") or (http.user_agent contains "Go-http-client") or (http.user_agent contains "wget") or (http.user_agent contains "libwww") or (http.user_agent contains "httpie") or (http.user_agent contains "perl") or (http.user_agent contains "ruby") or (http.user_agent contains "urllib") or (http.user_agent contains "mechanize") or (http.user_agent contains "PhantomJS") or (http.user_agent contains "headless") or (http.user_agent contains "CasperJS") or (http.user_agent contains "Nightmare") or (http.user_agent contains "Scrapy") or (http.user_agent contains "axios") or (http.user_agent contains "node-fetch") or (http.user_agent contains "undici") or (http.user_agent contains "http.rb") or (http.user_agent contains "aiohttp") or (http.user_agent contains "httpx") or (http.user_agent contains "Postman") or (http.user_agent contains "Insomnia") or (http.user_agent contains "Apache-HttpClient") or (http.user_agent contains "okhttp") or (http.user_agent contains "Dalvik") or (http.user_agent contains "Java/") or (http.user_agent contains "libcurl") or (http.user_agent contains "masscan") or (http.user_agent contains "Nmap") or (http.user_agent contains "sqlmap") or (http.user_agent contains "nikto") or (http.user_agent contains "Nuclei") or (http.user_agent contains "dirbuster") or (http.user_agent contains "gobuster") or (http.user_agent contains "wfuzz") or (http.user_agent contains "ZmEu") or (http.user_agent contains "Havij") or (http.user_agent contains "Xrumer") or (http.user_agent contains "SemrushBot") or (http.user_agent contains "AhrefsBot") or (http.user_agent contains "MJ12bot") or (http.user_agent contains "DotBot") or (http.user_agent contains "BLEXBot") or (http.user_agent contains "PetalBot") or (http.user_agent contains "MegaIndex") or (http.user_agent contains "DataForSeoBot") or (http.user_agent contains "Bytespider") or (http.user_agent contains "GPTBot") or (http.user_agent contains "CCBot") or (http.user_agent contains "anthropic-ai") or (http.user_agent contains "ClaudeBot") or (http.user_agent contains "ChatGPT-User") or (http.user_agent contains "cohere-ai") or (http.user_agent contains "Mozilla" and not any(lower(http.request.headers.names[*])[*] contains "accept-encoding")))`,
};

const RULE_3_CHROMIUM_SPOOF: WafRuleDefinition = {
  description: "[Anti-DDoS] Rule 3: Challenge — Phát hiện giả mạo Chromium (Client Hints)",
  action: "managed_challenge",
  enabled: true,
  expression: [
    `(not cf.client.bot)`,
    `(not any(lower(http.request.headers.names[*])[*] contains "authorization"))`,
    `(not any(lower(http.request.headers.names[*])[*] contains "x-api-key"))`,
    `(http.user_agent contains "Chrome/" and not http.user_agent contains "Firefox" and not http.user_agent contains "Edg/")`,
    `((not any(lower(http.request.headers.names[*])[*] contains "sec-ch-ua")) or (not any(lower(http.request.headers.names[*])[*] contains "sec-fetch-dest")) or (not any(lower(http.request.headers.names[*])[*] contains "sec-fetch-mode")) or (not any(lower(http.request.headers.names[*])[*] contains "sec-fetch-site")) or (not any(lower(http.request.headers.names[*])[*] contains "accept")) or (not any(lower(http.request.headers.names[*])[*] contains "accept-language")))`,
  ].join(" and "),
};

const RULE_4_ASN_DATACENTER: WafRuleDefinition = {
  description: "[Anti-DDoS] Rule 4: Challenge — Traffic từ Datacenter & VPS toàn cầu",
  action: "managed_challenge",
  enabled: true,
  expression: [
    `(not cf.client.bot)`,
    `(not any(lower(http.request.headers.names[*])[*] contains "authorization"))`,
    `(not any(lower(http.request.headers.names[*])[*] contains "x-api-key"))`,
    `(ip.src.asnum in {16276 14061 24940 32244 393406 45102 46602 49505 51167 54203 55023 58065 60068 62240 63949 9009 15169 16509 20473 32475 26496 36351 46562 206264 8075 200651 212238 47583 53842 12876 21156 3582 30058 29073 202422 20860 3949 200698 397373 40065 31898 43350 20001 50673 18978 206499 64267 203020 202636 21859 396998 141995 24785 39351 133177 398101 213327 210644 61138 205117 395354 135338 204444 3462 20773 201133 46261 55293 209588 396072 197695 396362 136907 45899 4785 7489 19624 62567 394380 19318 399629 36024 22612 13768 19437 49981 60631 44592 211680 62904 208046 207960 210558 13213 199524 59253 212815 41378 34549 199610 202448 62005 64425 53667 136258 45090 10929 131199 47447})`,
  ].join(" and "),
};

const RULE_5_FLOOD_ANOMALY: WafRuleDefinition = {
  description: "[Anti-DDoS] Rule 5: Challenge — Chống flood bypass cache & HTTP anomaly",
  action: "managed_challenge",
  enabled: true,
  expression: [
    `(not cf.client.bot)`,
    `(not any(lower(http.request.headers.names[*])[*] contains "authorization"))`,
    `(not any(lower(http.request.headers.names[*])[*] contains "x-api-key"))`,
    `(not http.request.uri.path contains "/api/")`,
    `((http.request.uri.query ne "" and len(http.request.uri.query) gt 50 and not any(lower(http.request.headers.names[*])[*] eq "referer") and not http.request.uri.query contains "utm_" and not http.request.uri.query contains "fbclid" and not http.request.uri.query contains "gclid" and not http.request.uri.query contains "msclkid" and not http.user_agent contains "Mozilla") or (http.request.uri.query ne "" and len(http.request.uri.query) gt 100 and not http.user_agent contains "Mozilla") or (http.request.method in {"POST" "PUT" "DELETE" "PATCH"} and not any(lower(http.request.headers.names[*])[*] eq "referer") and not any(lower(http.request.headers.names[*])[*] eq "content-type")) or (len(http.request.uri) gt 2000) or (http.request.method eq "POST" and not any(lower(http.request.headers.names[*])[*] eq "content-type") and not http.request.uri.path contains "/api/"))`,
  ].join(" and "),
};

const ALL_WAF_RULES: WafRuleDefinition[] = [
  RULE_1_BYPASS,
  RULE_2_BLOCK,
  RULE_3_CHROMIUM_SPOOF,
  RULE_4_ASN_DATACENTER,
  RULE_5_FLOOD_ANOMALY,
];

export async function verifyCloudflareAccess(credentials: CloudflareCredentials) {
  const res = await cfFetch(credentials, "");
  if (!res.success) {
    throw new Error(`Xác thực thất bại: ${res.errors.map((e) => e.message).join(", ")}`);
  }
  return {
    zoneId: res.result.id,
    zoneName: res.result.name,
    status: res.result.status,
    plan: res.result.plan?.name || "Unknown",
  };
}

async function getZoneRulesetId(credentials: CloudflareCredentials): Promise<string> {
  const res = await cfFetch<any[]>(credentials, "/rulesets");
  if (!res.success) {
    throw new Error(`Không lấy được danh sách ruleset: ${res.errors.map((e) => e.message).join(", ")}`);
  }

  const customRuleset = res.result.find(
    (rs: any) => rs.phase === "http_request_firewall_custom" && rs.kind === "zone"
  );

  if (customRuleset) return customRuleset.id;

  const createRes = await cfFetch(credentials, "/rulesets", "POST", {
    name: "Zone Custom WAF Ruleset",
    description: "Anti-DDoS WAF Rules",
    kind: "zone",
    phase: "http_request_firewall_custom",
    rules: [],
  });

  if (!createRes.success) {
    throw new Error(`Không tạo được ruleset: ${createRes.errors.map((e) => e.message).join(", ")}`);
  }

  return createRes.result.id;
}

export async function deployWafRules(credentials: CloudflareCredentials): Promise<DeployResult> {
  const result: DeployResult = {
    success: false,
    rulesDeployed: 0,
    ruleResults: [],
    settingsApplied: [],
  };

  try {
    const rulesetId = await getZoneRulesetId(credentials);

    const currentRuleset = await cfFetch<any>(credentials, `/rulesets/${rulesetId}`);

    const existingRules = (currentRuleset.result?.rules || []).filter(
      (r: any) => !r.description?.startsWith("[Anti-DDoS]")
    );

    const newRules = ALL_WAF_RULES.map((rule) => ({
      description: rule.description,
      expression: rule.expression,
      action: rule.action,
      ...(rule.action_parameters ? { action_parameters: rule.action_parameters } : {}),
      enabled: rule.enabled,
    }));

    const allRules = [...newRules, ...existingRules];

    const updateRes = await cfFetch(credentials, `/rulesets/${rulesetId}`, "PUT", {
      name: "Zone Custom WAF Ruleset",
      description: "Anti-DDoS WAF Rules — Deployed by VaniStudio",
      rules: allRules,
    });

    if (updateRes.success) {
      result.rulesDeployed = newRules.length;
      for (const rule of ALL_WAF_RULES) {
        result.ruleResults.push({ name: rule.description, success: true });
      }
    } else {
      const errorDetail = updateRes.errors.map((e) => `[${e.code}] ${e.message}`).join(" | ");
      for (const rule of ALL_WAF_RULES) {
        result.ruleResults.push({
          name: rule.description,
          success: false,
          error: errorDetail,
        });
      }
    }
  } catch (err: any) {
    const errorMsg = err.data?.errors
      ? err.data.errors.map((e: any) => `[${e.code}] ${e.message}`).join(" | ")
      : err.message || String(err);
    result.ruleResults.push({
      name: "WAF Rules Deployment",
      success: false,
      error: errorMsg,
    });
  }

  result.success = result.ruleResults.every((r) => r.success);
  return result;
}

export async function applySecuritySettings(credentials: CloudflareCredentials): Promise<DeployResult["settingsApplied"]> {
  const results: DeployResult["settingsApplied"] = [];

  try {
    const res = await cfFetch(credentials, "/settings/security_level", "PATCH", {
      value: "high",
    });
    results.push({ name: "Security Level → High", success: res.success, error: res.success ? undefined : res.errors[0]?.message });
  } catch (e: any) {
    results.push({ name: "Security Level → High", success: false, error: e.message });
  }

  try {
    const res = await cfFetch(credentials, "/settings/browser_check", "PATCH", {
      value: "on",
    });
    results.push({ name: "Browser Integrity Check → ON", success: res.success, error: res.success ? undefined : res.errors[0]?.message });
  } catch (e: any) {
    results.push({ name: "Browser Integrity Check → ON", success: false, error: e.message });
  }

  try {
    const res = await cfFetch(credentials, "/settings/ssl", "PATCH", {
      value: "strict",
    });
    results.push({ name: "SSL Mode → Full (Strict)", success: res.success, error: res.success ? undefined : res.errors[0]?.message });
  } catch (e: any) {
    results.push({ name: "SSL Mode → Full (Strict)", success: false, error: e.message });
  }

  try {
    const res = await cfFetch(credentials, "/settings/min_tls_version", "PATCH", {
      value: "1.2",
    });
    results.push({ name: "Minimum TLS Version → 1.2", success: res.success, error: res.success ? undefined : res.errors[0]?.message });
  } catch (e: any) {
    results.push({ name: "Minimum TLS Version → 1.2", success: false, error: e.message });
  }

  try {
    const res = await cfFetch(credentials, "/settings/always_use_https", "PATCH", {
      value: "on",
    });
    results.push({ name: "Always Use HTTPS → ON", success: res.success, error: res.success ? undefined : res.errors[0]?.message });
  } catch (e: any) {
    results.push({ name: "Always Use HTTPS → ON", success: false, error: e.message });
  }

  try {
    const res = await cfFetch(credentials, "/bot_management", "PUT", {
      fight_mode: true,
      sbfm_definitely_automated: "block",
      sbfm_likely_automated: "managed_challenge",
      sbfm_verified_bots: "allow",
      sbfm_static_resource_protection: false,
    });
    results.push({ name: "Bot Fight Mode → ON", success: res.success, error: res.success ? undefined : res.errors[0]?.message });
  } catch (e: any) {
    results.push({ name: "Bot Fight Mode → ON (bật thủ công trên Dashboard)", success: false, error: "Cần bật thủ công: Security → Bots → Bot Fight Mode" });
  }

  try {
    const res = await cfFetch(credentials, "/settings/cache_level", "PATCH", {
      value: "aggressive",
    });
    results.push({ name: "Caching Level → Aggressive", success: res.success, error: res.success ? undefined : res.errors[0]?.message });
  } catch (e: any) {
    results.push({ name: "Caching Level → Aggressive", success: false, error: e.message });
  }

  return results;
}

export async function disableUnderAttackMode(credentials: CloudflareCredentials) {
  const res = await cfFetch(credentials, "/settings/security_level", "PATCH", {
    value: "high",
  });
  return {
    success: res.success,
    error: res.success ? undefined : res.errors.map((e) => e.message).join(", "),
  };
}

export async function enableUnderAttackMode(credentials: CloudflareCredentials) {
  const res = await cfFetch(credentials, "/settings/security_level", "PATCH", {
    value: "under_attack",
  });
  return {
    success: res.success,
    error: res.success ? undefined : res.errors.map((e) => e.message).join(", "),
  };
}

export async function listCurrentWafRules(credentials: CloudflareCredentials) {
  const rulesetId = await getZoneRulesetId(credentials);
  const res = await cfFetch<any>(credentials, `/rulesets/${rulesetId}`);

  if (!res.success) {
    throw new Error(`Không lấy được rules: ${res.errors.map((e) => e.message).join(", ")}`);
  }

  return (res.result?.rules || []).map((r: any) => ({
    id: r.id,
    description: r.description,
    action: r.action,
    enabled: r.enabled,
    isAntiDdos: r.description?.startsWith("[Anti-DDoS]") || false,
  }));
}

export async function removeAntiDdosRules(credentials: CloudflareCredentials) {
  let wafRemoved = 0;
  let rlRemoved = 0;
  const errors: string[] = [];

  try {
    const rulesetId = await getZoneRulesetId(credentials);
    const currentRuleset = await cfFetch<any>(credentials, `/rulesets/${rulesetId}`);
    const remainingRules = (currentRuleset.result?.rules || []).filter(
      (r: any) => !r.description?.startsWith("[Anti-DDoS]")
    );
    wafRemoved = (currentRuleset.result?.rules?.length || 0) - remainingRules.length;

    if (wafRemoved > 0) {
      const updateRes = await cfFetch(credentials, `/rulesets/${rulesetId}`, "PUT", {
        name: "Zone Custom WAF Ruleset",
        description: "Custom WAF Rules",
        rules: remainingRules,
      });
      if (!updateRes.success) errors.push(`WAF: ${updateRes.errors.map((e) => e.message).join(", ")}`);
    }
  } catch (e: any) {
    errors.push(`WAF: ${e.message}`);
  }

  try {
    const rlResult = await removeRateLimitRules(credentials);
    rlRemoved = rlResult.rulesRemoved;
    if (!rlResult.success && rlResult.error) errors.push(`Rate Limit: ${rlResult.error}`);
  } catch (e: any) {
    errors.push(`Rate Limit: ${e.message}`);
  }

  return {
    success: errors.length === 0,
    rulesRemoved: wafRemoved + rlRemoved,
    error: errors.length > 0 ? errors.join(" | ") : undefined,
  };
}

async function getRateLimitRulesetId(credentials: CloudflareCredentials): Promise<string> {
  const res = await cfFetch<any[]>(credentials, "/rulesets");
  if (!res.success) {
    throw new Error(`Không lấy được rulesets: ${res.errors.map((e) => e.message).join(", ")}`);
  }

  const rlRuleset = res.result.find(
    (rs: any) => rs.phase === "http_ratelimit" && rs.kind === "zone"
  );

  if (rlRuleset) return rlRuleset.id;

  const createRes = await cfFetch(credentials, "/rulesets", "POST", {
    name: "Zone Rate Limiting Ruleset",
    description: "Anti-DDoS Rate Limiting",
    kind: "zone",
    phase: "http_ratelimit",
    rules: [],
  });

  if (!createRes.success) {
    throw new Error(`Không tạo được rate limit ruleset: ${createRes.errors.map((e) => e.message).join(", ")}`);
  }

  return createRes.result.id;
}

export async function deployRateLimitRule(credentials: CloudflareCredentials) {
  try {
    const rulesetId = await getRateLimitRulesetId(credentials);

    const currentRuleset = await cfFetch<any>(credentials, `/rulesets/${rulesetId}`);

    const existingRules = (currentRuleset.result?.rules || []).filter(
      (r: any) => !r.description?.startsWith("[Anti-DDoS]")
    );

    const rateLimitRule = {
      description: "[Anti-DDoS] Rate Limit: 100 req/10s per IP → Block 60s",
      expression: `(not cf.client.bot) and (not http.request.uri.path contains "/api/") and (not http.request.uri.path.extension in {"css" "js" "jpg" "jpeg" "png" "gif" "ico" "svg" "webp" "avif" "woff" "woff2" "ttf" "eot" "otf" "mp4" "webm" "ogg" "mp3" "wav" "pdf" "zip" "gz" "br" "map"})`,
      action: "block",
      ratelimit: {
        characteristics: ["cf.colo.id", "ip.src"],
        period: 10,
        requests_per_period: 100,
        mitigation_timeout: 10,
      },
      enabled: true,
    };

    const allRules = [rateLimitRule, ...existingRules];

    const updateRes = await cfFetch(credentials, `/rulesets/${rulesetId}`, "PUT", {
      name: "Zone Rate Limiting Ruleset",
      description: "Anti-DDoS Rate Limiting — Deployed by VaniStudio",
      rules: allRules,
    });

    if (updateRes.success) {
      return { name: rateLimitRule.description, success: true };
    } else {
      const errorDetail = updateRes.errors.map((e) => `[${e.code}] ${e.message}`).join(" | ");
      return { name: rateLimitRule.description, success: false, error: errorDetail };
    }
  } catch (err: any) {
    const errorMsg = err.data?.errors
      ? err.data.errors.map((e: any) => `[${e.code}] ${e.message}`).join(" | ")
      : err.message || String(err);
    return { name: "Rate Limit Rule", success: false, error: errorMsg };
  }
}

export async function removeRateLimitRules(credentials: CloudflareCredentials) {
  try {
    const rulesetId = await getRateLimitRulesetId(credentials);
    const currentRuleset = await cfFetch<any>(credentials, `/rulesets/${rulesetId}`);

    const remaining = (currentRuleset.result?.rules || []).filter(
      (r: any) => !r.description?.startsWith("[Anti-DDoS]")
    );

    const removed = (currentRuleset.result?.rules?.length || 0) - remaining.length;

    if (removed === 0) return { success: true, rulesRemoved: 0 };

    const updateRes = await cfFetch(credentials, `/rulesets/${rulesetId}`, "PUT", {
      name: "Zone Rate Limiting Ruleset",
      description: "Rate Limiting Rules",
      rules: remaining,
    });

    return {
      success: updateRes.success,
      rulesRemoved: removed,
      error: updateRes.success ? undefined : updateRes.errors.map((e) => e.message).join(", "),
    };
  } catch (err: any) {
    return { success: false, rulesRemoved: 0, error: err.message };
  }
}

export async function deployFullAntiDdos(credentials: CloudflareCredentials): Promise<DeployResult> {
  const zone = await verifyCloudflareAccess(credentials);

  const wafResult = await deployWafRules(credentials);

  const rateLimitResult = await deployRateLimitRule(credentials);
  wafResult.ruleResults.push(rateLimitResult);
  if (rateLimitResult.success) wafResult.rulesDeployed++;

  const settingsResult = await applySecuritySettings(credentials);

  return {
    success: wafResult.ruleResults.every((r) => r.success) && settingsResult.every((s) => s.success),
    rulesDeployed: wafResult.rulesDeployed,
    ruleResults: wafResult.ruleResults,
    settingsApplied: settingsResult,
  };
}

export async function getSecurityStatus(credentials: CloudflareCredentials) {
  const [secLevel, browserCheck, ssl, tls, https] = await Promise.all([
    cfFetch(credentials, "/settings/security_level").catch(() => null),
    cfFetch(credentials, "/settings/browser_check").catch(() => null),
    cfFetch(credentials, "/settings/ssl").catch(() => null),
    cfFetch(credentials, "/settings/min_tls_version").catch(() => null),
    cfFetch(credentials, "/settings/always_use_https").catch(() => null),
  ]);

  let rules: any[] = [];
  try {
    rules = await listCurrentWafRules(credentials);
  } catch {}

  return {
    securityLevel: (secLevel?.result as any)?.value || "unknown",
    browserCheck: (browserCheck?.result as any)?.value || "unknown",
    sslMode: (ssl?.result as any)?.value || "unknown",
    minTlsVersion: (tls?.result as any)?.value || "unknown",
    alwaysHttps: (https?.result as any)?.value || "unknown",
    wafRules: rules,
    antiDdosDeployed: rules.some((r: any) => r.isAntiDdos),
  };
}
