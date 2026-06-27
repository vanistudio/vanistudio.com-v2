"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface DiscordAccount {
  id: string;
  discordId: string;
  username: string;
  globalName: string;
  avatar: string | null;
  banner: string | null;
  accentColor: string | null;
  status: "active" | "invalid" | "rate_limited" | "phone_lock" | "suspended";
  proxy: string | null;
  proxyStatus: "active" | "dead" | "unknown";
  nitroType: "None" | "Nitro Classic" | "Nitro Basic" | "Nitro Boost";
  badges: string[];
  connections: Array<{ type: string; name: string }>;
  guildsCount: number;
  isRunning: boolean;
  createdAt: string;
}

interface AccountDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: DiscordAccount | null;
}

const DISCORD_BADGE_ICONS: Record<string, string> = {
  "Discord Staff": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordstaff.svg",
  "Discord Partner": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordpartner.svg",
  "HypeSquad Events": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadevents.svg",
  "Bug Hunter Level 1": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbughunter1.svg",
  "HypeSquad Bravery": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbravery.svg",
  "HypeSquad Brilliance": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbrilliance.svg",
  "HypeSquad Balance": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbalance.svg",
  "Early Supporter": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordearlysupporter.svg",
  "Bug Hunter Level 2": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbughunter2.svg",
  "Verified Developer": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbotdev.svg",
  "Certified Moderator Alumni": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordmod.svg",
  "Bot HTTP Interactions": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/supportscommands.svg",
  "Active Developer": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/activedeveloper.svg",
};

const getCreationDate = (id: string): string => {
  try {
    const idBig = BigInt(id);
    const timestamp = Number((idBig / BigInt(4194304)) + BigInt(1420070400000));
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Không rõ";
  }
};

const getAccentColorStyle = (accentColor: string | null) => {
  if (!accentColor) return {};
  return { backgroundColor: accentColor };
};

const getConnectionIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "github":
      return "bxl:github";
    case "youtube":
      return "bxl:youtube";
    case "steam":
      return "bxl:steam";
    case "twitch":
      return "bxl:twitch";
    case "spotify":
      return "bxl:spotify";
    case "twitter":
      return "bxl:twitter";
    case "facebook":
      return "bxl:facebook";
    case "reddit":
      return "bxl:reddit";
    case "xbox":
      return "bxl:xbox";
    case "playstation":
      return "bxl:playstation";
    default:
      return "solar:link-line-duotone";
  }
};

export default function AccountDetailsDialog({
  open,
  onOpenChange,
  account,
}: AccountDetailsDialogProps) {
  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[85vh] flex flex-col gap-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0">
              <Icon icon="ic:baseline-discord" className="size-5" />
            </div>
            Chi tiết tài khoản Discord
          </DialogTitle>
          <DialogDescription className="text-left mt-1 text-[13px]">
            Thông tin chi tiết về profile, Nitro, cấu hình thanh toán và danh sách liên kết.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-2 space-y-5 max-h-[55vh]">
          <div className="rounded-xl overflow-hidden border border-border bg-card/60 relative shrink-0">
            {account.banner ? (
              <div className="w-full relative aspect-[3/1] overflow-hidden bg-muted">
                <img
                  src={account.banner}
                  alt="Banner"
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "w-full aspect-[3/1] relative bg-cover bg-center",
                  !account.accentColor ? "bg-primary/20" : ""
                )}
                style={getAccentColorStyle(account.accentColor)}
              />
            )}

            <div className="px-4 relative z-10 -mt-10">
              <div className="relative size-20 rounded-full border-4 border-card bg-muted shrink-0 shadow-md overflow-hidden">
                <img
                  src={account.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"}
                  alt={account.username}
                  className="size-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png";
                  }}
                />
              </div>
            </div>

            <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {account.globalName || account.username}
                    </h3>
                    <Badge variant="secondary" className="text-[8px] font-bold px-1.5 py-0">
                      User
                    </Badge>
                    {account.status === "active" ? (
                      <Badge variant="success" className="text-[8px] font-bold px-1.5 py-0">
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[8px] font-bold px-1.5 py-0">
                        Lỗi xác thực
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                    @{account.username} <span className="text-[8px] opacity-60">({account.discordId})</span>
                  </p>
                </div>

                {((account.badges && account.badges.length > 0) || (account.nitroType && account.nitroType !== "None")) && (
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 bg-background/30 p-1.5 rounded-lg border border-border/40">
                    {account.nitroType && account.nitroType !== "None" && (
                      <div title={`Discord Nitro (${account.nitroType})`}>
                        <img
                          src="https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordnitro.svg"
                          alt="Discord Nitro"
                          className="size-5 object-contain"
                        />
                      </div>
                    )}
                    {account.badges?.map((badge: string, i: number) => {
                      const iconUrl = DISCORD_BADGE_ICONS[badge];
                      if (iconUrl) {
                        return (
                          <div key={i} title={badge}>
                            <img
                              src={iconUrl}
                              alt={badge}
                              className="size-5 object-contain"
                            />
                          </div>
                        );
                      }
                      return (
                        <Badge key={i} variant="outline" className="text-[9px] font-semibold py-0.5 px-1.5 border-none text-foreground/80 bg-transparent hover:bg-transparent">
                          {badge}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4 bg-background/20 border-border/50 flex flex-col gap-2.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Icon icon="solar:user-line-duotone" />
                Thông tin cơ bản
              </span>
              <div className="text-xs flex flex-col gap-1.5">
                <div className="flex justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Discord ID:</span>
                  <span className="font-semibold text-foreground">{account.discordId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span className="font-semibold text-foreground">{getCreationDate(account.discordId)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Trạng thái xác thực:</span>
                  <span className="font-bold text-foreground">
                    {account.status === "active" ? (
                      <span className="text-emerald-500">Đang hoạt động</span>
                    ) : (
                      <span className="text-red-500">Lỗi / Bị khóa</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Khởi tạo ở hệ thống:</span>
                  <span className="font-semibold text-foreground">
                    {new Date(account.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-background/20 border-border/50 flex flex-col gap-2.5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Icon icon="solar:settings-line-duotone" />
                Cấu hình kết nối & Gateway
              </span>
              <div className="text-xs flex flex-col gap-1.5">
                <div className="flex justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Cổng kết nối Gateway:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    {account.isRunning ? (
                      <>
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-500">Đang hoạt động (Live)</span>
                      </>
                    ) : (
                      <>
                        <span className="size-2 rounded-full bg-gray-500" />
                        <span className="text-muted-foreground">Ngoại tuyến (Offline)</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/10">
                  <span className="text-muted-foreground">Trạng thái Proxy:</span>
                  <span className="font-bold text-foreground">
                    {account.proxy ? (
                      account.proxyStatus === "active" ? (
                        <span className="text-emerald-500">Hoạt động (Live)</span>
                      ) : (
                        <span className="text-red-500">Hỏng (Dead)</span>
                      )
                    ) : (
                      <span className="text-muted-foreground">Không sử dụng</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col py-1 border-b border-border/10 gap-1">
                  <span className="text-muted-foreground">Địa chỉ Proxy:</span>
                  <span className="font-mono text-[10px] text-foreground break-all bg-background/20 p-1.5 rounded border border-border/30">
                    {account.proxy || "Không dùng proxy"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-background/20 border-border/50 flex flex-col gap-3">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Icon icon="solar:card-recieved-line-duotone" />
              Gói dịch vụ & Thanh toán
            </span>
            <div className="text-xs flex flex-col gap-2">
              <div className="flex justify-between items-center py-1 border-b border-border/10">
                <span className="text-muted-foreground">Đăng ký Nitro:</span>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-bold",
                      account.nitroType === "None"
                        ? "border-border text-foreground"
                        : "bg-vanixjnk/15 text-vanixjnk border-vanixjnk/25 hover:bg-vanixjnk/15"
                    )}
                  >
                    {account.nitroType !== "None" ? account.nitroType : "Không có"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {account.connections && account.connections.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Icon icon="solar:share-line-duotone" />
                Liên kết tài khoản ({account.connections.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {account.connections.map((conn, i) => (
                  <div key={i} className="p-2 rounded-lg border border-border/60 bg-background/20 flex items-center gap-2 text-xs">
                    <Icon icon={getConnectionIcon(conn.type)} className="size-4 shrink-0 text-foreground/80" />
                    <div className="flex flex-col min-w-0 flex-grow">
                      <span className="font-bold text-foreground truncate" title={conn.name}>
                        {conn.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-tight truncate">
                        {conn.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
