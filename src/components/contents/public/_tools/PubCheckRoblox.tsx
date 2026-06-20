"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface ProfileResult {
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

interface AssetDetails {
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

interface PlaceResult {
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

export default function PubCheckRoblox() {
  const [activeTab, setActiveTab] = useState<"user" | "place">("user");
  const [userInput, setUserInput] = useState("");
  const [placeInput, setPlaceInput] = useState("");

  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [wearing, setWearing] = useState<AssetDetails[]>([]);
  const [place, setPlace] = useState<PlaceResult | null>(null);

  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(false);

  const checkUserMutation = trpc.tools.checkRobloxUser.useMutation();
  const checkWearingMutation = trpc.tools.checkRobloxUserCurrentlyWearing.useMutation();
  const checkPlaceMutation = trpc.tools.checkRobloxPlace.useMutation();

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = userInput.trim();
    if (!target) {
      toast.warning("Vui lòng nhập Username hoặc User ID Roblox.");
      return;
    }

    setLoadingUser(true);
    setProfile(null);
    setWearing([]);

    try {
      let isUserId = /^\d+$/.test(target);
      const parsedUser = await checkUserMutation.mutateAsync({
        userIdOrUsername: isUserId ? parseInt(target, 10) : target,
      });

      setProfile(parsedUser as ProfileResult);
      toast.success(`Đã lấy thông tin người dùng: ${parsedUser.displayName}`);

      try {
        const parsedWearing = await checkWearingMutation.mutateAsync({
          userId: parsedUser.id,
        });
        setWearing(parsedWearing as AssetDetails[]);
      } catch {
        toast.error("Không thể lấy danh sách vật phẩm đang đeo.");
      }

    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lấy thông tin người dùng Roblox.");
    } finally {
      setLoadingUser(false);
    }
  };

  const handleCheckPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = placeInput.trim();
    if (!target || isNaN(parseInt(target, 10))) {
      toast.warning("Vui lòng nhập Place ID hợp lệ.");
      return;
    }

    setLoadingPlace(true);
    setPlace(null);

    try {
      const parsedPlace = await checkPlaceMutation.mutateAsync({
        placeId: parseInt(target, 10),
      });
      setPlace(parsedPlace as PlaceResult);
      toast.success(`Đã lấy thông tin Place: ${parsedPlace.name}`);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lấy thông tin place.");
    } finally {
      setLoadingPlace(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:gamepad-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Kiểm Tra Roblox Profile & Place</h1>
              <p className="text-sm text-muted-foreground">
                Tra cứu nhanh thông tin người dùng, danh sách vật phẩm đang đeo (Avatar Wearing), nhóm (Groups) và thông tin chi tiết game/place Roblox mà không cần API Key.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
            <button
              onClick={() => setActiveTab("user")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeTab === "user"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:user-rounded-line-duotone" className="size-4" />
              <span>Kiểm tra Roblox User</span>
            </button>
            <button
              onClick={() => setActiveTab("place")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeTab === "place"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:gamepad-line-duotone" className="size-4" />
              <span>Kiểm tra Roblox Game/Place</span>
            </button>
          </div>

          {activeTab === "user" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              <div className="lg:col-span-4 flex flex-col gap-4">
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-sm text-foreground">Tra cứu người dùng Roblox</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Nhập Username (Tên hiển thị) hoặc mã User ID để lấy thông tin hồ sơ, tình trạng hoạt động.
                    </p>
                  </div>

                  <form onSubmit={handleCheckUser} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="userInput" className="text-xs font-bold text-foreground">
                        Username hoặc User ID
                      </Label>
                      <Input
                        id="userInput"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ví dụ: Roblox hoặc 1"
                        className="text-xs font-mono"
                        disabled={loadingUser}
                      />
                    </div>

                    <div className="flex gap-2 justify-end items-center border-t border-border/40 pt-4">
                      {userInput && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserInput("");
                            setProfile(null);
                            setWearing([]);
                          }}
                          disabled={loadingUser}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Xóa
                        </Button>
                      )}

                      <Button
                        type="submit"
                        variant="vanixjnk"
                        size="sm"
                        disabled={loadingUser}
                        className="font-bold text-xs px-4"
                      >
                        {loadingUser ? (
                          <>
                            <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin" />
                            <span>Đang kiểm tra...</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:play-line-duotone" className="size-4" />
                            <span>Bắt đầu</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                {profile ? (
                  <Card id="roblox-data-content" className="p-5 bg-card/30 border-border flex flex-col gap-6 relative overflow-hidden text-foreground">
                    <div className="relative z-1">
                      <div id="roblox-user-banner" className="h-24 z-1 rounded-xl relative bg-background/40 border border-border/50 overflow-hidden flex items-center justify-end px-6">
                        <div className="flex gap-4 text-xs rounded-xl bg-background/60 backdrop-blur-md border border-border/60 px-5 py-3 shadow-sm text-foreground">
                          <div className="text-center">
                            <span id="roblox-user-friends" className="font-extrabold text-foreground">{formatNumber(profile.friendsCount)}</span>
                            <p className="text-[10px] text-muted-foreground font-medium">Friends</p>
                          </div>
                          <div className="text-center border-l border-border/50 pl-4">
                            <span id="roblox-user-followers" className="font-extrabold text-foreground">{formatNumber(profile.followersCount)}</span>
                            <p className="text-[10px] text-muted-foreground font-medium">Followers</p>
                          </div>
                          <div className="text-center border-l border-border/50 pl-4">
                            <span id="roblox-user-following" className="font-extrabold text-foreground">{formatNumber(profile.followingCount)}</span>
                            <p className="text-[10px] text-muted-foreground font-medium">Following</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center -mt-16 z-10 px-6 pt-2">
                      <div className="roblox-avatars relative size-24 rounded-2xl overflow-hidden border-2 bg-muted shrink-0 shadow-lg shadow-vanixjnk/5">
                        <img
                          id="roblox-user-avatar"
                          decoding="async"
                          loading="lazy"
                          className="size-full object-cover scale-[1.1] select-none pointer-events-none"
                          draggable="false"
                          alt="User Avatar"
                          src={profile.avatarUrl || "https://tr.rbxcdn.com/30day-avatarheadshot/150/150/AvatarHeadshot/Png/noFilter"}
                        />
                      </div>
                      <div className="ml-4 mt-8 flex flex-col justify-between w-full pb-2">
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h2 id="roblox-user-name" className="text-lg font-black text-foreground">{profile.displayName}</h2>
                              {profile.hasVerifiedBadge && (
                                <Icon icon="solar:verified-check-bold" className="text-sky-500 size-4 shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">
                              <span id="roblox-user-username">@{profile.name}</span>
                              <span className="text-[10px] text-muted-foreground/60 ml-2 font-mono">UID: {profile.id}</span>
                            </div>
                          </div>
                          <Button
                            asChild
                            variant="vanixjnk"
                            size="sm"
                            className="font-bold text-xs rounded-full h-8 px-4"
                          >
                            <a
                              id="roblox-view-link"
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://www.roblox.com/users/${profile.id}/profile`}
                            >
                              <span className="block md:hidden">
                                <Icon icon="solar:arrow-right-line-duotone" className="size-4" />
                              </span>
                              <span className="hidden md:block">View Profile</span>
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <section className="px-6 pb-6 max-h-[500px] overflow-y-auto">
                      <h2 className="sr-only">{profile.displayName}'s Roblox Account Details Information</h2>
                      
                      <div className="flex flex-col gap-1.5 mb-4">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tiểu sử / Giới thiệu</span>
                        <p id="roblox-user-description" className="text-xs text-foreground/80 bg-background/25 p-3.5 rounded-xl border border-border/50 min-h-[50px] whitespace-pre-wrap leading-relaxed">
                          {profile.description || "Người dùng này không viết tiểu sử."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div id="roblox-full-body-preview" className="lg:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-background/35 border border-border/50 relative overflow-hidden min-h-[300px]">
                          <span className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Xem thử Avatar</span>
                          <div className="relative w-full flex items-center justify-center h-64 bg-background/10 rounded-lg border border-border/30">
                            <img
                              decoding="async"
                              loading="lazy"
                              src={profile.avatarUrlFull || "https://tr.rbxcdn.com/30day-avatar/352/352/Avatar/Png/noFilter"}
                              alt="Full Body Avatar Preview"
                              id="roblox-avatar-preview"
                              className="h-full max-h-60 object-contain select-none pointer-events-none p-2"
                            />
                          </div>
                        </div>

                        <div className="lg:col-span-8 flex flex-col flex-grow">
                          <span className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Đang đeo trên người ({wearing.length})</span>
                          <div id="roblox-user-catalog" className="grid grid-cols-4 md:grid-cols-6 gap-3 p-4 rounded-xl bg-background/35 border border-border/50 overflow-y-auto max-h-[264px] h-[264px]">
                            {wearing.length > 0 ? (
                              wearing.map((item) => (
                                <div key={item.assetId} className="w-full aspect-square">
                                  <HoverCard openDelay={200} closeDelay={200}>
                                    <HoverCardTrigger asChild>
                                      <a
                                        href={`https://www.roblox.com/catalog/${item.assetId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block relative w-full h-full rounded-xl overflow-hidden border border-border p-1 group"
                                      >
                                        <img
                                          src={item.thumbnailUrl || "https://images.rbxcdn.com/5eb20917cf530583e2641c0e1f7ba95e.png"}
                                          alt={item.name}
                                          className="size-full object-cover rounded-lg"
                                        />
                                        {item.isForSale && (
                                          <div className="absolute bottom-0.5 right-0.5 bg-background/90 px-1 py-0.5 rounded text-[8px] font-bold text-amber-500 flex items-center gap-0.5 border border-border/40 shadow-sm">
                                            <Icon icon="simple-icons:roblox" className="size-2 shrink-0" />
                                            <span>{item.priceInRobux || "0"}</span>
                                          </div>
                                        )}
                                      </a>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80 p-4" align="center" side="top">
                                      <div className="flex gap-3">
                                        <div className="size-20 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                                          <img
                                            src={item.thumbnailUrl || "https://images.rbxcdn.com/5eb20917cf530583e2641c0e1f7ba95e.png"}
                                            alt={item.name}
                                            className="size-full object-cover"
                                          />
                                        </div>
                                        <div className="flex flex-col flex-grow min-w-0 justify-between">
                                          <div className="flex flex-col gap-1">
                                            <span className="text-xs font-black text-foreground line-clamp-2" title={item.name}>
                                              {item.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                              Tác giả: <span className="font-semibold text-foreground/80">@{item.creator.name}</span>
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                              Loại: <span className="font-semibold text-foreground/80">{item.assetTypeName}</span>
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-2">
                                            <div className="flex items-center gap-1.5">
                                              {item.isForSale ? (
                                                <>
                                                  <Icon icon="simple-icons:roblox" className="text-amber-500 size-4 shrink-0" />
                                                  <span className="text-sm font-black text-foreground">{item.priceInRobux || "Free"}</span>
                                                </>
                                              ) : (
                                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-bold uppercase">
                                                  Off Sale
                                                </Badge>
                                              )}
                                            </div>
                                            <Button
                                              asChild
                                              variant="outline"
                                              size="xs"
                                              className="h-7 text-[10px] font-bold gap-1"
                                            >
                                              <a
                                                href={`https://www.roblox.com/catalog/${item.assetId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <span>Chi tiết</span>
                                                <Icon icon="solar:arrow-right-up-linear" className="size-3" />
                                              </a>
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                              ))
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                                <Icon icon="solar:hanger-line-duotone" className="size-8 opacity-60 animate-pulse" />
                                <span className="text-xs font-medium">Không đeo vật phẩm nào</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col mt-4">
                        <span className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Nhóm đã tham gia ({profile.groups.length})</span>
                        <div id="roblox-user-groups" className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 p-4 rounded-xl bg-background/35 border border-border/50">
                          {profile.groups.length > 0 ? (
                            profile.groups.map((group) => (
                              <div key={group.id} className="w-full aspect-square">
                                <HoverCard openDelay={200} closeDelay={200}>
                                  <HoverCardTrigger asChild>
                                    <a
                                      href={`https://www.roblox.com/groups/${group.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="relative w-full h-full p-1 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center border border-border bg-background"
                                    >
                                      <img
                                        src={group.iconUrl || "https://images.rbxcdn.com/5eb20917cf530583e2641c0e1f7ba95e.png"}
                                        alt={group.name}
                                        className="size-full object-cover rounded-lg"
                                      />
                                    </a>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80 p-4" align="center" side="top">
                                    <div className="flex gap-3">
                                      <div className="size-20 rounded-lg overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
                                        {group.iconUrl ? (
                                          <img
                                            src={group.iconUrl}
                                            alt={group.name}
                                            className="size-full object-cover"
                                          />
                                        ) : (
                                          <Icon icon="solar:users-group-two-rounded-line-duotone" className="size-10 text-muted-foreground/60" />
                                        )}
                                      </div>
                                      <div className="flex flex-col flex-grow min-w-0 justify-between">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-xs font-black text-foreground line-clamp-2" title={group.name}>
                                            {group.name}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground">
                                            Vai trò: <span className="font-semibold text-foreground/80">{group.roleName} (Rank {group.roleRank})</span>
                                          </span>
                                          <span className="text-[10px] text-muted-foreground">
                                            Thành viên: <span className="font-semibold text-foreground/80">{formatNumber(group.memberCount)}</span>
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-2">
                                          <div className="text-[9px] text-muted-foreground">
                                            ID: {group.id}
                                          </div>
                                          <Button
                                            asChild
                                            variant="outline"
                                            size="xs"
                                            className="h-7 text-[10px] font-bold gap-1"
                                          >
                                            <a
                                              href={`https://www.roblox.com/groups/${group.id}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <span>Xem nhóm</span>
                                              <Icon icon="solar:arrow-right-up-linear" className="size-3" />
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            ))
                          ) : (
                            <div className="w-full py-4 text-center text-muted-foreground text-xs font-medium">
                              Chưa tham gia nhóm nào.
                            </div>
                          )}
                        </div>
                      </div>


                    </section>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-card/10 text-center gap-2.5 flex-1 min-h-[300px]">
                    <Icon icon="solar:checklist-line-duotone" className="size-10 text-muted-foreground/60" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs text-foreground">Chưa có kết quả tìm kiếm</span>
                      <span className="text-[11px] text-muted-foreground">Điền tên tài khoản Roblox ở khung bên trái và bấm Bắt đầu để kiểm tra.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "place" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              <div className="lg:col-span-4 flex flex-col gap-4">
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-sm text-foreground">Tra cứu game/place Roblox</h3>
                    <p className="text-[11px] text-muted-foreground">
                      Nhập mã Place ID (ví dụ: lấy từ link game roblox.com/games/...) để xem trạng thái người chơi, lượt truy cập.
                    </p>
                  </div>

                  <form onSubmit={handleCheckPlace} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="placeInput" className="text-xs font-bold text-foreground">
                        Roblox Place ID
                      </Label>
                      <Input
                        id="placeInput"
                        value={placeInput}
                        onChange={(e) => setPlaceInput(e.target.value)}
                        placeholder="Ví dụ: 4913581645"
                        className="text-xs font-mono"
                        disabled={loadingPlace}
                      />
                    </div>

                    <div className="flex gap-2 justify-end items-center border-t border-border/40 pt-4">
                      {placeInput && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPlaceInput("");
                            setPlace(null);
                          }}
                          disabled={loadingPlace}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Xóa
                        </Button>
                      )}

                      <Button
                        type="submit"
                        variant="vanixjnk"
                        size="sm"
                        disabled={loadingPlace}
                        className="font-bold text-xs px-4"
                      >
                        {loadingPlace ? (
                          <>
                            <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin" />
                            <span>Đang kiểm tra...</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="solar:play-line-duotone" className="size-4" />
                            <span>Bắt đầu</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              <div className="lg:col-span-8 flex flex-col gap-6 w-full">
                {place ? (
                  <Card id="roblox-place-content" className="p-5 bg-card/30 border-border flex flex-col gap-6 relative overflow-hidden text-foreground">
                    <div className="relative z-1">
                      <div
                        id="roblox-place-banner"
                        className="h-24 z-1 rounded-xl relative bg-cover bg-center overflow-hidden flex items-center justify-end px-6 border border-border/50"
                        style={{
                          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.5)), url(${place.thumbnailUrl || "https://images.rbxcdn.com/5eb20917cf530583e2641c0e1f7ba95e.png"})`,
                        }}
                      >
                        <div className="flex gap-4 text-xs rounded-xl bg-background/60 backdrop-blur-md border border-border/60 px-5 py-3 shadow-sm text-foreground">
                          <div className="text-center flex flex-col items-center justify-center">
                            <span className="flex items-center gap-1 font-extrabold text-emerald-500">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              {formatNumber(place.playing)}
                            </span>
                            <p className="text-[10px] text-muted-foreground font-medium">Playing</p>
                          </div>
                          <div className="text-center border-l border-border/50 pl-4">
                            <span className="font-extrabold text-foreground">{formatNumber(place.visits)}</span>
                            <p className="text-[10px] text-muted-foreground font-medium">Visits</p>
                          </div>
                          <div className="text-center border-l border-border/50 pl-4">
                            <span className="font-extrabold text-foreground">{formatNumber(place.favoritedCount)}</span>
                            <p className="text-[10px] text-muted-foreground font-medium">Favorites</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center -mt-16 z-10 px-6 pt-2">
                      <div className="roblox-avatars relative size-24 rounded-2xl overflow-hidden border-2 bg-muted shrink-0 shadow-lg shadow-vanixjnk/5">
                        <img
                          id="roblox-place-icon"
                          decoding="async"
                          loading="lazy"
                          className="size-full object-cover select-none pointer-events-none"
                          draggable="false"
                          alt="Place Icon"
                          src={place.iconUrl || place.thumbnailUrl || "https://images.rbxcdn.com/5eb20917cf530583e2641c0e1f7ba95e.png"}
                        />
                      </div>
                      <div className="ml-4 mt-8 flex flex-col justify-between w-full pb-2">
                        <div className="flex justify-between items-center gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h2 id="roblox-place-name" className="text-lg font-black text-foreground">{place.name}</h2>
                            </div>
                            <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 flex-wrap">
                              <span>Tạo bởi:</span>
                              <span className="font-bold text-foreground/80">@{place.creator.name}</span>
                              {place.creator.hasVerifiedBadge && (
                                <Icon icon="solar:verified-check-bold" className="text-sky-500 size-3.5 shrink-0" />
                              )}
                              <span className="text-[10px] text-muted-foreground/60 ml-2 font-mono">Place ID: {place.placeId}</span>
                            </div>
                          </div>
                          <Button
                            asChild
                            variant="vanixjnk"
                            size="sm"
                            className="font-bold text-xs rounded-full h-8 px-4"
                          >
                            <a
                              id="roblox-play-link"
                              target="_blank"
                              rel="noopener noreferrer"
                              href={`https://www.roblox.com/games/${place.placeId}`}
                            >
                              <Icon icon="solar:play-line-duotone" className="size-4 mr-1.5" />
                              <span>Chơi trên Roblox</span>
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <section className="px-6 pb-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-background/35 border border-border/50 relative overflow-hidden min-h-[220px]">
                          <span className="text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">Hình ảnh Game</span>
                          <div className="relative w-full aspect-video bg-background/10 rounded-lg border border-border/30 overflow-hidden flex items-center justify-center">
                            <img
                              decoding="async"
                              loading="lazy"
                              src={place.thumbnailUrl || "https://images.rbxcdn.com/5eb20917cf530583e2641c0e1f7ba95e.png"}
                              alt="Game Thumbnail Preview"
                              className="w-full h-full object-cover select-none pointer-events-none"
                              draggable="false"
                            />
                          </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mô tả game</span>
                            <p id="roblox-place-description" className="text-xs text-foreground/80 bg-background/25 p-3.5 rounded-xl border border-border/50 min-h-[100px] max-h-[160px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                              {place.description || "Trò chơi này không có mô tả."}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-4 text-xs">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Thông tin kịch bản</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between py-1 border-b border-border/20">
                                  <span className="text-muted-foreground">Thể loại:</span>
                                  <span className="font-semibold text-foreground">{place.genre}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/20">
                                  <span className="text-muted-foreground">Phí vào game:</span>
                                  <span className="font-bold text-foreground">
                                    {place.price > 0 ? `${place.price} Robux` : "Miễn phí"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/20">
                                  <span className="text-muted-foreground">Max Server:</span>
                                  <span className="font-semibold text-foreground">{place.maxPlayers} người chơi</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Lịch sử</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between py-1 border-b border-border/20">
                                  <span className="text-muted-foreground">Ngày tạo:</span>
                                  <span className="font-semibold text-foreground">{formatDate(place.created)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/20">
                                  <span className="text-muted-foreground">Cập nhật cuối:</span>
                                  <span className="font-semibold text-foreground">{formatDate(place.updated)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border/20">
                                  <span className="text-muted-foreground">Universe ID:</span>
                                  <span className="font-mono text-[10px] text-foreground">{place.universeId}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end border-t border-border/40 pt-4 mt-4">
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => copyToClipboard(String(place.placeId), "Đã sao chép Place ID")}
                          className="text-[10px] font-bold"
                        >
                          Sao chép Place ID
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => copyToClipboard(String(place.universeId), "Đã sao chép Universe ID")}
                          className="text-[10px] font-bold"
                        >
                          Sao chép Universe ID
                        </Button>
                      </div>
                    </section>
                  </Card>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-card/10 text-center gap-2.5 flex-1 min-h-[300px]">
                    <Icon icon="solar:checklist-line-duotone" className="size-10 text-muted-foreground/60" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs text-foreground">Chưa có kết quả tìm kiếm</span>
                      <span className="text-[11px] text-muted-foreground">Điền mã Place ID ở khung bên trái và bấm Bắt đầu để kiểm tra.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
