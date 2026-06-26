import { http } from "@/lib/http";

export interface DiscordAccountInfo {
  id: string;
  username: string;
  discriminator: string;
  globalName: string | null;
  avatar: string | null;
  avatarUrl: string;
  banner: string | null;
  bannerUrl: string | null;
  accentColor: number | null;
  mfaEnabled: boolean;
  locale: string | null;
  email: string | null;
  verified: boolean | null;
  phone: string | null;
  bio: string | null;
  nsfwAllowed: boolean | null;
  bot: boolean;
  system: boolean;
  flags: number;
  premiumType: number;
  badges: string[];
  nitroType: string;
  nitroExpiry: string | null;
  connections: Array<{
    type: string;
    id: string;
    name: string;
    verified: boolean;
    friendSync?: boolean;
    showActivity?: boolean;
    twoWayLink?: boolean;
  }> | null;
  guilds: {
    totalCount: number;
    adminOrOwnerCount: number;
    list: Array<{
      id: string;
      name: string;
      icon: string | null;
      iconUrl: string | null;
      owner: boolean;
      permissions: string;
      isAdmin: boolean;
    }>;
  } | null;
  settings: {
    theme: string;
    developerMode: boolean;
    status: string;
    customStatus: {
      text: string | null;
      emoji: string | null;
    } | null;
  } | null;
  billing: {
    hasPaymentSource: boolean;
    sources: Array<{
      id: string;
      type: number;
      typeName: string;
      brand: string | null;
      last4: string | null;
      expiresMonth: number | null;
      expiresYear: number | null;
      email: string | null;
      invalid: boolean;
      default: boolean;
    }>;
  } | null;
  botInfo: {
    botPublic: boolean;
    botRequireCodeGrant: boolean;
    owner: {
      id: string;
      username: string;
      globalName: string | null;
    } | null;
    team: {
      id: string;
      name: string;
      membersCount: number;
    } | null;
  } | null;
}

function parseUserFlags(flags: number): string[] {
  const badges: string[] = [];
  if (flags & (1 << 0)) badges.push("Discord Staff");
  if (flags & (1 << 1)) badges.push("Discord Partner");
  if (flags & (1 << 2)) badges.push("HypeSquad Events");
  if (flags & (1 << 3)) badges.push("Bug Hunter Level 1");
  if (flags & (1 << 6)) badges.push("HypeSquad Bravery");
  if (flags & (1 << 7)) badges.push("HypeSquad Brilliance");
  if (flags & (1 << 8)) badges.push("HypeSquad Balance");
  if (flags & (1 << 9)) badges.push("Early Supporter");
  if (flags & (1 << 10)) badges.push("Team Pseudo User");
  if (flags & (1 << 14)) badges.push("Bug Hunter Level 2");
  if (flags & (1 << 16)) badges.push("Verified Bot");
  if (flags & (1 << 17)) badges.push("Verified Developer");
  if (flags & (1 << 18)) badges.push("Certified Moderator Alumni");
  if (flags & (1 << 19)) badges.push("Bot HTTP Interactions");
  if (flags & (1 << 22)) badges.push("Active Developer");
  return badges;
}

function parsePremiumType(type: number): string {
  switch (type) {
    case 1:
      return "Nitro Classic";
    case 2:
      return "Nitro";
    case 3:
      return "Nitro Basic";
    default:
      return "None";
  }
}

function getDefaultAvatarUrl(id: string, discriminator: string): string {
  let index = 0;
  if (discriminator === "0" || !discriminator) {
    try {
      const idBig = BigInt(id);
      index = Number((idBig >> BigInt(22)) % BigInt(6));
    } catch {
      index = 0;
    }
  } else {
    const discNum = parseInt(discriminator, 10);
    index = isNaN(discNum) ? 0 : discNum % 5;
  }
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function getAvatarUrl(id: string, avatar: string | null, discriminator: string): string {
  if (!avatar) {
    return getDefaultAvatarUrl(id, discriminator);
  }
  const isAnimated = avatar.startsWith("a_");
  const ext = isAnimated ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${id}/${avatar}.${ext}?size=512`;
}

function getBannerUrl(id: string, banner: string | null): string | null {
  if (!banner) return null;
  const isAnimated = banner.startsWith("a_");
  const ext = isAnimated ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${id}/${banner}.${ext}?size=1024`;
}

function getGuildIconUrl(guildId: string, iconHash: string | null): string | null {
  if (!iconHash) return null;
  const isAnimated = iconHash.startsWith("a_");
  const ext = isAnimated ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=256`;
}

async function fetchDiscordMe(authHeader: string): Promise<any> {
  return await http.get<any>("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: authHeader,
    },
    timeout: 6000,
  });
}

function hasAdminPermission(permissionsStr: string): boolean {
  try {
    const perm = BigInt(permissionsStr);
    const ADMIN_BIT = BigInt(0x8);
    return (perm & ADMIN_BIT) === ADMIN_BIT;
  } catch {
    return false;
  }
}

export async function checkDiscordToken(token: string): Promise<DiscordAccountInfo> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error("Token Discord không được để trống");
  }

  let rawInfo: any = null;
  let lastError: any = null;
  let usedAuthHeader = "";

  if (cleanToken.startsWith("Bot ") || cleanToken.startsWith("Bearer ")) {
    try {
      usedAuthHeader = cleanToken;
      rawInfo = await fetchDiscordMe(cleanToken);
    } catch (err: any) {
      lastError = err;
    }
  } else {
    const authAttempts = [
      `Bearer ${cleanToken}`,
      `Bot ${cleanToken}`,
      cleanToken,
    ];

    for (const authHeader of authAttempts) {
      try {
        rawInfo = await fetchDiscordMe(authHeader);
        if (rawInfo) {
          usedAuthHeader = authHeader;
          break;
        }
      } catch (err: any) {
        lastError = err;
        if (err.status !== 401) {
          break;
        }
      }
    }
  }

  if (!rawInfo) {
    const errorMsg = lastError?.data?.message || lastError?.message || "Token không hợp lệ hoặc không thể kết nối tới Discord";
    throw new Error(`Xác thực Discord thất bại: ${errorMsg}`);
  }

  const userId = rawInfo.id;
  const isBot = !!rawInfo.bot;
  const isSelfToken = !isBot && !usedAuthHeader.startsWith("Bearer ") && !usedAuthHeader.startsWith("Bot ");

  let connections: any[] | null = null;
  let guildsInfo: DiscordAccountInfo["guilds"] = null;
  let settingsInfo: DiscordAccountInfo["settings"] = null;
  let billingInfo: DiscordAccountInfo["billing"] = null;
  let botInfo: DiscordAccountInfo["botInfo"] = null;
  let nitroExpiry: string | null = null;

  try {
    connections = await http.get<any[]>("https://discord.com/api/v10/users/@me/connections", {
      headers: { Authorization: usedAuthHeader },
      timeout: 4000,
    });
  } catch {
    connections = null;
  }

  try {
    const rawGuilds = await http.get<any[]>("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: usedAuthHeader },
      timeout: 5000,
    });

    if (Array.isArray(rawGuilds)) {
      const list = rawGuilds.map((g: any) => {
        const isAdmin = g.owner || hasAdminPermission(g.permissions || "0");
        return {
          id: g.id,
          name: g.name,
          icon: g.icon || null,
          iconUrl: getGuildIconUrl(g.id, g.icon),
          owner: !!g.owner,
          permissions: g.permissions || "0",
          isAdmin,
        };
      });

      guildsInfo = {
        totalCount: list.length,
        adminOrOwnerCount: list.filter(g => g.isAdmin).length,
        list,
      };
    }
  } catch {
    guildsInfo = null;
  }

  if (isSelfToken) {
    try {
      const rawSettings = await http.get<any>("https://discord.com/api/v10/users/@me/settings", {
        headers: { Authorization: usedAuthHeader },
        timeout: 4000,
      });
      if (rawSettings) {
        settingsInfo = {
          theme: rawSettings.theme || "dark",
          developerMode: !!rawSettings.developer_mode,
          status: rawSettings.status || "offline",
          customStatus: rawSettings.custom_status ? {
            text: rawSettings.custom_status.text || null,
            emoji: rawSettings.custom_status.emoji_name || null,
          } : null,
        };
      }
    } catch {
      settingsInfo = null;
    }

    try {
      const rawBilling = await http.get<any[]>("https://discord.com/api/v10/users/@me/billing/payment-sources", {
        headers: { Authorization: usedAuthHeader },
        timeout: 4000,
      });

      if (Array.isArray(rawBilling)) {
        const sources = rawBilling.map((bill: any) => {
          let typeName = "Unknown";
          if (bill.type === 1) typeName = "Credit Card";
          else if (bill.type === 2) typeName = "PayPal";

          return {
            id: bill.id,
            type: typeof bill.type === "number" ? bill.type : 0,
            typeName,
            brand: bill.brand || null,
            last4: bill.last_4 || null,
            expiresMonth: typeof bill.expires_month === "number" ? bill.expires_month : null,
            expiresYear: typeof bill.expires_year === "number" ? bill.expires_year : null,
            email: bill.email || null,
            invalid: !!bill.invalid,
            default: !!bill.default,
          };
        });

        billingInfo = {
          hasPaymentSource: sources.length > 0,
          sources,
        };
      }
    } catch {
      billingInfo = null;
    }

    try {
      const rawSubs = await http.get<any[]>("https://discord.com/api/v10/users/@me/billing/subscriptions", {
        headers: { Authorization: usedAuthHeader },
        timeout: 4000,
      });
      if (Array.isArray(rawSubs) && rawSubs.length > 0) {
        const nitroSub = rawSubs.find(s => s.type === 1 || s.status === 0);
        if (nitroSub?.current_period_end) {
          nitroExpiry = new Date(nitroSub.current_period_end).toISOString();
        }
      }
    } catch {
      nitroExpiry = null;
    }
  }

  if (isBot) {
    try {
      const rawApp = await http.get<any>("https://discord.com/api/v10/applications/@me", {
        headers: { Authorization: usedAuthHeader },
        timeout: 4000,
      });

      if (rawApp) {
        botInfo = {
          botPublic: !!rawApp.bot_public,
          botRequireCodeGrant: !!rawApp.bot_require_code_grant,
          owner: rawApp.owner ? {
            id: rawApp.owner.id,
            username: rawApp.owner.username,
            globalName: rawApp.owner.global_name || null,
          } : null,
          team: rawApp.team ? {
            id: rawApp.team.id,
            name: rawApp.team.name,
            membersCount: Array.isArray(rawApp.team.members) ? rawApp.team.members.length : 0,
          } : null,
        };
      }
    } catch {
      botInfo = null;
    }
  }

  const userFlags = typeof rawInfo.flags === "number" ? rawInfo.flags : (typeof rawInfo.public_flags === "number" ? rawInfo.public_flags : 0);

  return {
    id: userId,
    username: rawInfo.username,
    discriminator: rawInfo.discriminator || "0",
    globalName: rawInfo.global_name || null,
    avatar: rawInfo.avatar || null,
    avatarUrl: getAvatarUrl(userId, rawInfo.avatar, rawInfo.discriminator || "0"),
    banner: rawInfo.banner || null,
    bannerUrl: getBannerUrl(userId, rawInfo.banner),
    accentColor: typeof rawInfo.accent_color === "number" ? rawInfo.accent_color : null,
    mfaEnabled: !!rawInfo.mfa_enabled,
    locale: rawInfo.locale || null,
    email: rawInfo.email || null,
    verified: typeof rawInfo.verified === "boolean" ? rawInfo.verified : null,
    phone: rawInfo.phone || null,
    bio: rawInfo.bio || null,
    nsfwAllowed: typeof rawInfo.nsfw_allowed === "boolean" ? rawInfo.nsfw_allowed : null,
    bot: isBot,
    system: !!rawInfo.system,
    flags: userFlags,
    premiumType: typeof rawInfo.premium_type === "number" ? rawInfo.premium_type : 0,
    badges: parseUserFlags(userFlags),
    nitroType: parsePremiumType(typeof rawInfo.premium_type === "number" ? rawInfo.premium_type : 0),
    nitroExpiry,
    connections: Array.isArray(connections) ? connections.map((conn: any) => ({
      type: conn.type,
      id: conn.id,
      name: conn.name,
      verified: !!conn.verified,
      friendSync: !!conn.friend_sync,
      showActivity: !!conn.show_activity,
      twoWayLink: !!conn.two_way_link,
    })) : null,
    guilds: guildsInfo,
    settings: settingsInfo,
    billing: billingInfo,
    botInfo,
  };
}
