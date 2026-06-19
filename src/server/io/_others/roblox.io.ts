import { http } from "@/lib/http";

async function robloxPost<T>(url: string, body: any): Promise<T> {
  try {
    return await http.post<T>(url, body);
  } catch (err: any) {
    if (err.status === 403 && err.response) {
      const csrfToken = err.response.headers.get("x-csrf-token");
      if (csrfToken) {
        return await http.post<T>(url, body, {
          headers: {
            "X-CSRF-TOKEN": csrfToken,
          },
        });
      }
    }
    throw err;
  }
}

export interface RobloxProfile {
  id: number;
  name: string;
  displayName: string;
  description: string;
  created: string;
  isBanned: boolean;
  hasVerifiedBadge: boolean;
  status: string;
  avatarUrl: string;
  avatarUrlFull: string;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  presence: {
    type: "Offline" | "Online" | "InGame" | "InStudio";
    lastOnline?: string;
    lastLocation?: string;
    placeId?: number;
    universeId?: number;
    gameId?: string;
  };
  groups: {
    id: number;
    name: string;
    roleName: string;
    roleRank: number;
    memberCount: number;
    hasVerifiedBadge: boolean;
    iconUrl: string;
  }[];
}

export interface RobloxPlaceDetails {
  placeId: number;
  universeId: number;
  name: string;
  description: string;
  creator: {
    id: number;
    name: string;
    type: "User" | "Group";
    hasVerifiedBadge: boolean;
  };
  rootPlaceId: number;
  created: string;
  updated: string;
  price: number;
  genre: string;
  maxPlayers: number;
  visits: number;
  playing: number;
  favoritedCount: number;
  iconUrl: string;
  thumbnailUrl: string;
}

export async function resolveUsernameToId(username: string): Promise<number> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    throw new Error("Tên người dùng không được để trống");
  }

  try {
    const res = await robloxPost<{ data: { id: number; name: string; displayName: string }[] }>(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [cleanUsername],
        excludeBannedUsers: false,
      }
    );

    if (!res?.data || res.data.length === 0) {
      throw new Error(`Không tìm thấy người dùng Roblox có tên: ${cleanUsername}`);
    }

    return res.data[0].id;
  } catch (err: any) {
    if (err.status === 400) {
      throw new Error("Tên người dùng không hợp lệ");
    }
    throw new Error(err.message || "Lỗi khi phân giải tên người dùng Roblox");
  }
}

export async function checkUserProfile(userIdOrUsername: string | number): Promise<RobloxProfile> {
  let userId: number;

  if (typeof userIdOrUsername === "number") {
    userId = userIdOrUsername;
  } else {
    const parsed = parseInt(userIdOrUsername, 10);
    if (!isNaN(parsed) && String(parsed) === userIdOrUsername.trim()) {
      userId = parsed;
    } else {
      userId = await resolveUsernameToId(userIdOrUsername);
    }
  }

  let baseInfo: any;
  try {
    baseInfo = await http.get<any>(`https://users.roblox.com/v1/users/${userId}`);
  } catch (err: any) {
    if (err.status === 404) {
      throw new Error("Người dùng Roblox không tồn tại");
    }
    throw new Error(err.message || "Lỗi khi lấy thông tin người dùng Roblox");
  }

  let status = "";
  try {
    const statusRes = await http.get<any>(`https://users.roblox.com/v1/users/${userId}/status`);
    status = statusRes?.status || "";
  } catch {
  }

  let avatarUrl = "";
  let avatarUrlFull = "";
  let friendsCount = 0;
  let followersCount = 0;
  let followingCount = 0;

  await Promise.allSettled([
    (async () => {
      try {
        const avatarRes = await http.get<any>(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=352x352&format=Png&isCircular=false`
        );
        if (avatarRes?.data?.[0]?.imageUrl) {
          avatarUrl = avatarRes.data[0].imageUrl;
        }
      } catch {}
    })(),
    (async () => {
      try {
        const avatarFullRes = await http.get<any>(
          `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=352x352&format=Png&isCircular=false`
        );
        if (avatarFullRes?.data?.[0]?.imageUrl) {
          avatarUrlFull = avatarFullRes.data[0].imageUrl;
        }
      } catch {}
    })(),
    (async () => {
      try {
        const friendsRes = await http.get<{ count: number }>(
          `https://friends.roblox.com/v1/users/${userId}/friends/count`
        );
        if (friendsRes && typeof friendsRes.count === "number") {
          friendsCount = friendsRes.count;
        }
      } catch {}
    })(),
    (async () => {
      try {
        const followersRes = await http.get<{ count: number }>(
          `https://friends.roblox.com/v1/users/${userId}/followers/count`
        );
        if (followersRes && typeof followersRes.count === "number") {
          followersCount = followersRes.count;
        }
      } catch {}
    })(),
    (async () => {
      try {
        const followingRes = await http.get<{ count: number }>(
          `https://friends.roblox.com/v1/users/${userId}/followings/count`
        );
        if (followingRes && typeof followingRes.count === "number") {
          followingCount = followingRes.count;
        }
      } catch {}
    })(),
  ]);

  let presence: RobloxProfile["presence"] = { type: "Offline" };
  try {
    const presenceRes = await robloxPost<any>("https://presence.roblox.com/v1/presence/users", {
      userIds: [userId],
    });
    const userPresence = presenceRes?.userPresences?.[0];
    if (userPresence) {
      const typeMap: Record<number, RobloxProfile["presence"]["type"]> = {
        0: "Offline",
        1: "Online",
        2: "InGame",
        3: "InStudio",
      };
      presence = {
        type: typeMap[userPresence.userPresenceType] || "Offline",
        lastOnline: userPresence.lastOnline,
        lastLocation: userPresence.lastLocation || undefined,
        placeId: userPresence.placeId || undefined,
        universeId: userPresence.universeId || undefined,
        gameId: userPresence.gameId || undefined,
      };
    }
  } catch {
  }

  let groups: RobloxProfile["groups"] = [];
  try {
    const groupsRes = await http.get<any>(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
    if (groupsRes?.data) {
      const parsedGroups = groupsRes.data.map((item: any) => ({
        id: item.group.id,
        name: item.group.name,
        roleName: item.role.name,
        roleRank: item.role.rank,
        memberCount: item.group.memberCount || 0,
        hasVerifiedBadge: !!item.group.hasVerifiedBadge,
        iconUrl: "",
      }));

      const groupIds = parsedGroups.map((g: any) => g.id);
      if (groupIds.length > 0) {
        try {
          const iconsRes = await http.get<{ data: { targetId: number; imageUrl: string }[] }>(
            `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(",")}&size=150x150&format=Png&isCircular=false`
          );
          if (iconsRes?.data) {
            const iconMap = new Map(iconsRes.data.map((item) => [item.targetId, item.imageUrl]));
            for (const g of parsedGroups) {
              g.iconUrl = iconMap.get(g.id) || "";
            }
          }
        } catch (err) {
          console.error("Lỗi khi lấy icon nhóm Roblox:", err);
        }
      }
      groups = parsedGroups;
    }
  } catch {
  }

  return {
    id: baseInfo.id,
    name: baseInfo.name,
    displayName: baseInfo.displayName,
    description: baseInfo.description || "",
    created: baseInfo.created,
    isBanned: !!baseInfo.isBanned,
    hasVerifiedBadge: !!baseInfo.hasVerifiedBadge,
    status,
    avatarUrl,
    avatarUrlFull,
    friendsCount,
    followersCount,
    followingCount,
    presence,
    groups,
  };
}

export async function checkPlaceDetails(placeId: number): Promise<RobloxPlaceDetails> {
  if (!placeId || isNaN(placeId)) {
    throw new Error("Mã game/place không hợp lệ");
  }

  let universeId: number;
  try {
    const universeRes = await http.get<{ universeId: number }>(
      `https://apis.roblox.com/universes/v1/places/${placeId}/universe`
    );
    if (!universeRes?.universeId) {
      throw new Error("Không thể phân giải universeId cho place này");
    }
    universeId = universeRes.universeId;
  } catch (err: any) {
    throw new Error(`Lỗi khi tìm universe cho place #${placeId}: ${err.message}`);
  }

  let universeDetails: any;
  try {
    const gamesRes = await http.get<{ data: any[] }>(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`
    );
    if (!gamesRes?.data || gamesRes.data.length === 0) {
      throw new Error("Không tìm thấy thông tin game trên Roblox");
    }
    universeDetails = gamesRes.data[0];
  } catch (err: any) {
    throw new Error(`Lỗi khi lấy thông tin game Roblox: ${err.message}`);
  }

  let iconUrl = "";
  try {
    const iconRes = await http.get<any>(
      `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&returnUseParentIconIfKeepAsPlaceholder=true&size=150x150&format=Png&isCircular=false`
    );
    if (iconRes?.data?.[0]?.imageUrl) {
      iconUrl = iconRes.data[0].imageUrl;
    }
  } catch {
  }

  let thumbnailUrl = "";
  try {
    const thumbRes = await http.get<any>(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`
    );
    const thumbData = thumbRes?.data?.[0]?.thumbnails?.[0];
    if (thumbData?.imageUrl) {
      thumbnailUrl = thumbData.imageUrl;
    }
  } catch {
  }

  return {
    placeId,
    universeId,
    name: universeDetails.name,
    description: universeDetails.description || "",
    creator: {
      id: universeDetails.creator.id,
      name: universeDetails.creator.name,
      type: universeDetails.creator.type,
      hasVerifiedBadge: !!universeDetails.creator.hasVerifiedBadge,
    },
    rootPlaceId: universeDetails.rootPlaceId,
    created: universeDetails.created,
    updated: universeDetails.updated,
    price: universeDetails.price || 0,
    genre: universeDetails.genre || "All",
    maxPlayers: universeDetails.maxPlayers || 0,
    visits: universeDetails.visits || 0,
    playing: universeDetails.playing || 0,
    favoritedCount: universeDetails.favoritedCount || 0,
    iconUrl,
    thumbnailUrl,
  };
}

export interface RobloxAssetDetails {
  assetId: number;
  name: string;
  description: string;
  assetTypeId: number;
  assetTypeName: string;
  creator: {
    id: number;
    name: string;
    type: string;
    hasVerifiedBadge: boolean;
  };
  created: string;
  updated: string;
  priceInRobux: number;
  isForSale: boolean;
  thumbnailUrl: string;
}

export interface RobloxGroupDetails {
  id: number;
  name: string;
  description: string;
  owner: {
    id: number;
    name: string;
    displayName: string;
    hasVerifiedBadge: boolean;
  } | null;
  shout: {
    body: string;
    poster: {
      id: number;
      name: string;
      displayName: string;
    };
    created: string;
  } | null;
  memberCount: number;
  hasVerifiedBadge: boolean;
}

export interface RobloxGroupRole {
  id: number;
  name: string;
  rank: number;
  memberCount: number;
}

export interface RobloxGamePass {
  id: number;
  name: string;
  displayName: string;
  description: string;
  price: number;
  productId: number;
  isForSale: boolean;
}

export interface RobloxBadge {
  id: number;
  name: string;
  description: string;
  displayName: string;
  iconImageId: number;
  awardCount: number;
  winRatePercentage: number;
  iconUrl?: string;
}

export interface RobloxFriend {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
}

export interface RobloxSearchResultUser {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
  previousUsernames: string[];
}

export function getAssetTypeName(typeId: number): string {
  const assetTypes: Record<number, string> = {
    1: "Image",
    2: "T-Shirt",
    3: "Audio",
    4: "Mesh",
    5: "Decal",
    8: "Hat",
    9: "Place",
    10: "Model",
    11: "Shirt",
    12: "Pants",
    13: "Decal",
    17: "Head",
    18: "Face",
    19: "Gear",
    24: "Clutter",
    27: "Torso",
    28: "Right Arm",
    29: "Left Arm",
    30: "Right Leg",
    31: "Left Leg",
    32: "Package",
    34: "Gamepass",
    38: "Plugin",
    41: "Hair Accessory",
    42: "Face Accessory",
    43: "Neck Accessory",
    44: "Shoulder Accessory",
    45: "Front Accessory",
    46: "Back Accessory",
    47: "Waist Accessory",
    48: "Climb Animation",
    49: "Death Animation",
    50: "Fall Animation",
    51: "Idle Animation",
    52: "Jump Animation",
    53: "Run Animation",
    54: "Swim Animation",
    55: "Walk Animation",
    56: "Pose Animation",
    61: "Emote Animation",
    62: "Video",
    64: "T-Shirt Accessory",
    65: "Shirt Accessory",
    66: "Pants Accessory",
    67: "Jacket Accessory",
    68: "Sweater Accessory",
    69: "Shorts Accessory",
    70: "Left Shoe Accessory",
    71: "Right Shoe Accessory",
    72: "Dress Accessory",
    73: "Eyebrow Accessory",
    74: "Eyelash Accessory",
    75: "Hair Accessory",
    76: "Hair Accessory",
    78: "Eyebrow Accessory",
    79: "Eyelash Accessory",
  };
  return assetTypes[typeId] || "Unknown";
}

export async function getUserCurrentlyWearing(userId: number): Promise<number[]> {
  if (!userId || isNaN(userId)) {
    throw new Error("Mã người dùng không hợp lệ");
  }

  try {
    const res = await http.get<{ assetIds: number[] }>(
      `https://avatar.roblox.com/v1/users/${userId}/currently-wearing`
    );
    return res?.assetIds || [];
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi lấy danh sách vật phẩm đang đeo");
  }
}

export async function getUserCurrentlyWearingDetails(userId: number): Promise<RobloxAssetDetails[]> {
  const assetIds = await getUserCurrentlyWearing(userId);
  if (assetIds.length === 0) {
    return [];
  }

  let thumbnailMap = new Map<number, string>();
  try {
    const batchSize = 50;
    for (let i = 0; i < assetIds.length; i += batchSize) {
      const chunk = assetIds.slice(i, i + batchSize);
      const thumbRes = await http.get<{ data: { targetId: number; imageUrl: string }[] }>(
        `https://thumbnails.roblox.com/v1/assets?assetIds=${chunk.join(",")}&size=420x420&format=Png&isCircular=false`
      );
      if (thumbRes?.data) {
        for (const item of thumbRes.data) {
          thumbnailMap.set(item.targetId, item.imageUrl);
        }
      }
    }
  } catch {
  }

  let details: RobloxAssetDetails[] = [];
  try {
    const batchItems = assetIds.map((id) => ({ itemType: "Asset", id }));
    const response = await robloxPost<{ data: any[] }>(
      "https://catalog.roblox.com/v1/catalog/items/details",
      { items: batchItems }
    );
    if (response?.data) {
      details = response.data.map((item: any) => {
        const isForSale = item.priceStatus === "For Sale" || !!item.price || item.isForSale;
        const price = item.price ?? item.lowestPrice ?? 0;
        return {
          assetId: item.id,
          name: item.name || "",
          description: item.description || "",
          assetTypeId: item.assetType || 0,
          assetTypeName: getAssetTypeName(item.assetType || 0),
          creator: {
            id: item.creatorTargetId || 0,
            name: item.creatorName || "",
            type: item.creatorType || "User",
            hasVerifiedBadge: !!item.creatorHasVerifiedBadge,
          },
          created: item.created || "",
          updated: item.updated || "",
          priceInRobux: price,
          isForSale: isForSale,
          thumbnailUrl: thumbnailMap.get(item.id) || "",
        };
      });
    }
  } catch (err) {
    console.error("Batch catalog API failed, falling back to single items:", err);
  }

  const loadedIds = new Set(details.map((d) => d.assetId));
  const missingIds = assetIds.filter((id) => !loadedIds.has(id));

  if (missingIds.length > 0) {
    const detailPromises = missingIds.map(async (assetId) => {
      try {
        const detail = await http.get<any>(
          `https://economy.roblox.com/v2/assets/${assetId}/details`
        );
        if (!detail) return null;

        return {
          assetId,
          name: detail.Name || "",
          description: detail.Description || "",
          assetTypeId: detail.AssetTypeId || 0,
          assetTypeName: getAssetTypeName(detail.AssetTypeId),
          creator: {
            id: detail.Creator?.Id || 0,
            name: detail.Creator?.Name || "",
            type: detail.Creator?.CreatorType || "User",
            hasVerifiedBadge: !!detail.Creator?.HasVerifiedBadge,
          },
          created: detail.Created || "",
          updated: detail.Updated || "",
          priceInRobux: detail.PriceInRobux || 0,
          isForSale: !!detail.IsForSale,
          thumbnailUrl: thumbnailMap.get(assetId) || "",
        } as RobloxAssetDetails;
      } catch {
        return null;
      }
    });

    const fallbackDetails = await Promise.all(detailPromises);
    for (const item of fallbackDetails) {
      if (item) details.push(item);
    }
  }

  return assetIds
    .map((id) => details.find((d) => d.assetId === id))
    .filter((item): item is RobloxAssetDetails => !!item);
}

export async function searchRobloxUsers(keyword: string, limit: number = 10): Promise<RobloxSearchResultUser[]> {
  const cleanKeyword = keyword.trim();
  if (!cleanKeyword) {
    throw new Error("Từ khóa tìm kiếm không được để trống");
  }

  let apiLimit = 10;
  if (limit > 50) apiLimit = 100;
  else if (limit > 25) apiLimit = 50;
  else if (limit > 10) apiLimit = 25;

  try {
    const res = await http.get<{ data: any[] }>(
      `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(cleanKeyword)}&limit=${apiLimit}`
    );
    if (!res?.data) return [];
    return res.data.map((user) => ({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      hasVerifiedBadge: !!user.hasVerifiedBadge,
      previousUsernames: user.previousUsernames || [],
    })).slice(0, limit);
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi tìm kiếm người dùng Roblox");
  }
}

export async function getRobloxGroupDetails(groupId: number): Promise<RobloxGroupDetails> {
  if (!groupId || isNaN(groupId)) {
    throw new Error("Mã nhóm không hợp lệ");
  }

  try {
    const res = await http.get<any>(`https://groups.roblox.com/v1/groups/${groupId}`);
    if (!res) {
      throw new Error("Không tìm thấy nhóm");
    }

    return {
      id: res.id,
      name: res.name || "",
      description: res.description || "",
      owner: res.owner ? {
        id: res.owner.userId,
        name: res.owner.username,
        displayName: res.owner.displayName,
        hasVerifiedBadge: !!res.owner.hasVerifiedBadge,
      } : null,
      shout: res.shout ? {
        body: res.shout.body || "",
        poster: {
          id: res.shout.poster.userId,
          name: res.shout.poster.username,
          displayName: res.shout.poster.displayName,
        },
        created: res.shout.created,
      } : null,
      memberCount: res.memberCount || 0,
      hasVerifiedBadge: !!res.hasVerifiedBadge,
    };
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi lấy thông tin nhóm Roblox");
  }
}

export async function getRobloxGroupRoles(groupId: number): Promise<RobloxGroupRole[]> {
  if (!groupId || isNaN(groupId)) {
    throw new Error("Mã nhóm không hợp lệ");
  }

  try {
    const res = await http.get<{ roles: any[] }>(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
    if (!res?.roles) return [];
    return res.roles.map((role) => ({
      id: role.id,
      name: role.name,
      rank: role.rank,
      memberCount: role.memberCount || 0,
    }));
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi lấy danh sách chức vụ của nhóm");
  }
}

export async function getUniverseGamePasses(universeId: number): Promise<RobloxGamePass[]> {
  if (!universeId || isNaN(universeId)) {
    throw new Error("Mã game/universe không hợp lệ");
  }

  try {
    const res = await http.get<{ gamePasses: any[] }>(
      `https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes`
    );
    if (!res?.gamePasses) return [];
    return res.gamePasses.map((pass) => ({
      id: pass.id,
      name: pass.name || "",
      displayName: pass.displayName || "",
      description: pass.description || "",
      price: pass.price || 0,
      productId: pass.productId || 0,
      isForSale: !!pass.isForSale,
    }));
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi lấy danh sách GamePass của game");
  }
}

export async function getUniverseBadges(universeId: number, limit: number = 100): Promise<RobloxBadge[]> {
  if (!universeId || isNaN(universeId)) {
    throw new Error("Mã game/universe không hợp lệ");
  }

  let apiLimit = 10;
  if (limit > 50) apiLimit = 100;
  else if (limit > 25) apiLimit = 50;
  else if (limit > 10) apiLimit = 25;

  try {
    const res = await http.get<{ data: any[] }>(
      `https://badges.roblox.com/v1/universes/${universeId}/badges?limit=${apiLimit}`
    );
    if (!res?.data) return [];
    return res.data.map((badge) => ({
      id: badge.id,
      name: badge.name || "",
      description: badge.description || "",
      displayName: badge.displayName || "",
      iconImageId: badge.iconImageId || 0,
      awardCount: badge.awardCount || 0,
      winRatePercentage: badge.winRatePercentage || 0,
    })).slice(0, limit);
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi lấy danh sách huy hiệu của game");
  }
}

export async function getUserFriends(userId: number): Promise<RobloxFriend[]> {
  if (!userId || isNaN(userId)) {
    throw new Error("Mã người dùng không hợp lệ");
  }

  try {
    const res = await http.get<{ data: any[] }>(
      `https://friends.roblox.com/v1/users/${userId}/friends`
    );
    if (!res?.data) return [];
    return res.data.map((friend) => ({
      id: friend.id,
      name: friend.name || "",
      displayName: friend.displayName || "",
      hasVerifiedBadge: !!friend.hasVerifiedBadge,
    }));
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi lấy danh sách bạn bè");
  }
}

export async function getUserBadges(userId: number, limit: number = 100): Promise<RobloxBadge[]> {
  if (!userId || isNaN(userId)) {
    throw new Error("Mã người dùng không hợp lệ");
  }

  try {
    const res = await http.get<{ data: any[] }>(
      `https://badges.roblox.com/v1/users/${userId}/badges?limit=${limit}&sortOrder=Desc`
    );
    if (!res?.data || res.data.length === 0) return [];

    const badges: RobloxBadge[] = res.data.map((badge) => ({
      id: badge.id,
      name: badge.name || "",
      description: badge.description || "",
      displayName: badge.displayName || "",
      iconImageId: badge.iconImageId || 0,
      awardCount: badge.awardCount || 0,
      winRatePercentage: badge.winRatePercentage || 0,
      iconUrl: "",
    }));

    const badgeIds = badges.map((b) => b.id);
    if (badgeIds.length > 0) {
      try {
        const iconsRes = await http.get<{ data: { targetId: number; imageUrl: string }[] }>(
          `https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${badgeIds.join(",")}&size=150x150&format=Png&isCircular=false`
        );
        if (iconsRes?.data) {
          const iconMap = new Map(iconsRes.data.map((item) => [item.targetId, item.imageUrl]));
          for (const b of badges) {
            b.iconUrl = iconMap.get(b.id) || "";
          }
        }
      } catch (err) {
        console.error("Lỗi khi lấy icon huy hiệu Roblox:", err);
      }
    }

    return badges;
  } catch (err: any) {
    throw new Error(err.message || "Lỗi khi lấy danh sách huy hiệu");
  }
}
