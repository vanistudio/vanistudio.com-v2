"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function AccountDetailsDialog({
  open,
  onOpenChange,
  account,
}: AccountDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"guilds" | "dms">("guilds");

  useEffect(() => {
    if (!open) {
      setActiveTab("guilds");
    }
  }, [open]);

  if (!account) return null;

  const mockGuilds = [
    { id: "g1", name: "Vani Studio Official", memberCount: 1420, icon: null },
    { id: "g2", name: "Discord API Developers", memberCount: 420910, icon: null },
    { id: "g3", name: "MMO Bot Farm Group", memberCount: 320, icon: null },
    { id: "g4", name: "Genshin Impact VietNam", memberCount: 15400, icon: null },
  ];

  const mockDms = [
    { id: "d1", name: "heloworld_user", lastMsg: "Check proxy hộ tôi với", time: "10 phút trước" },
    { id: "d2", name: "vani_support", lastMsg: "Token này đang hoạt động tốt nha bạn", time: "1 giờ trước" },
    { id: "d3", name: "spammer_bot_99", lastMsg: "Đã hoàn thành cấu hình tự động", time: "Hôm qua" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="solar:user-id-line-duotone" className="text-xl text-vanixjnk" />
            <span>Chi tiết tài khoản Discord</span>
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết và thống kê thời gian thực của tài khoản selfbot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
            {account.avatar ? (
              <img
                src={account.avatar}
                alt={account.username}
                className="size-14 rounded-full object-cover border border-vanixjnk/20 bg-neutral-900"
              />
            ) : (
              <div className="size-14 rounded-full bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 flex items-center justify-center">
                <Icon icon="solar:user-bold-duotone" className="size-7 text-vanixjnk/75" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground truncate text-base">
                {account.globalName}
              </h4>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {account.discordId}</p>
              <p className="text-xs text-vanixjnk font-medium mt-0.5">@{account.username}</p>
            </div>
            <div className="text-right">
              <Badge
                variant={account.status === "active" ? "success" : "destructive"}
                className="text-[10px] font-bold"
              >
                {account.status === "active" ? "Đang hoạt động" : "Lỗi xác thực"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl border flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Cổng Gateway
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    account.isRunning ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                  )}
                />
                <span className="text-xs font-bold text-foreground">
                  {account.isRunning ? "Đang kết nối" : "Ngoại tuyến / Tắt"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Gói tài khoản
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon
                  icon={
                    account.nitroType !== "None"
                      ? "solar:star-fall-minimalistic-line-duotone"
                      : "solar:user-line-duotone"
                  }
                  className={cn(
                    "size-4",
                    account.nitroType !== "None" ? "text-amber-500 animate-bounce" : "text-muted-foreground"
                  )}
                />
                <span className="text-xs font-bold text-foreground">
                  {account.nitroType !== "None" ? account.nitroType : "Tài khoản thường"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Máy chủ tham gia
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-extrabold text-foreground">
                  {account.guildsCount}
                </span>
                <span className="text-[10px] text-muted-foreground">guilds</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Trò chuyện cá nhân
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-extrabold text-foreground">
                  {mockDms.length}
                </span>
                <span className="text-[10px] text-muted-foreground">hội thoại</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Danh hiệu (Badges)
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-foreground truncate max-w-full">
                  {account.badges.join(", ") || "Không có"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Kết nối liên kết
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg font-extrabold text-foreground">
                  {account.connections.length}
                </span>
                <span className="text-[10px] text-muted-foreground">liên kết</span>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 border rounded-xl p-3 bg-muted/10">
            <div className="flex gap-4 border-b border-border/60 pb-1.5">
              <button
                type="button"
                className={cn(
                  "pb-1.5 px-0.5 text-xs font-bold border-b-2 transition-all cursor-pointer",
                  activeTab === "guilds"
                    ? "border-vanixjnk text-vanixjnk"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab("guilds")}
              >
                Máy chủ ({account.guildsCount})
              </button>
              <button
                type="button"
                className={cn(
                  "pb-1.5 px-0.5 text-xs font-bold border-b-2 transition-all cursor-pointer",
                  activeTab === "dms"
                    ? "border-vanixjnk text-vanixjnk"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab("dms")}
              >
                Trò chuyện ({mockDms.length})
              </button>
            </div>

            <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              {activeTab === "guilds" ? (
                mockGuilds.length > 0 ? (
                  mockGuilds.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate">{g.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {g.memberCount.toLocaleString()} thành viên
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    Không tìm thấy máy chủ nào
                  </div>
                )
              ) : mockDms.length > 0 ? (
                mockDms.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground truncate">@{d.name}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px]">
                        {d.lastMsg}
                      </span>
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium shrink-0">
                      {d.time}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Không tìm thấy cuộc trò chuyện nào
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Proxy kết nối
            </label>
            <div className="p-3 rounded-xl border flex items-center justify-between text-xs">
              <span className="font-mono text-muted-foreground break-all max-w-[70%]">
                {account.proxy || "Không dùng proxy"}
              </span>
              {account.proxy && (
                <Badge
                  variant={account.proxyStatus === "active" ? "success" : "destructive"}
                  className="text-[9px] font-bold"
                >
                  {account.proxyStatus === "active" ? "Live" : "Dead"}
                </Badge>
              )}
            </div>
          </div>
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
