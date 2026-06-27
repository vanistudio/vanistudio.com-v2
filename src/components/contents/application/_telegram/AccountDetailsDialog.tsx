"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import GroupDetailsDialog from "./GroupDetailsDialog";

interface TelegramAccount {
  id: string;
  phone: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  status: string;
  proxy: string | null;
  proxyStatus: string;
}

interface AccountDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: TelegramAccount | null;
  onLeaveChatSuccess: () => void;
}

export default function AccountDetailsDialog({
  open,
  onOpenChange,
  account,
  onLeaveChatSuccess,
}: AccountDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"groups" | "channels">("groups");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isChatDetailsOpen, setIsChatDetailsOpen] = useState(false);

  const { data: detailStats, isLoading, refetch } = trpc.application.telegram.getAccountStats.useQuery(
    { accountId: account?.id || "" },
    { enabled: !!account && open }
  );

  useEffect(() => {
    if (!open) {
      setActiveTab("groups");
      setSelectedChatId(null);
      setIsChatDetailsOpen(false);
    }
  }, [open]);

  const getDisplayName = (firstName?: string | null, lastName?: string | null) => {
    const parts = [firstName, lastName]
      .filter(Boolean)
      .map((p) => p!.trim())
      .filter((p) => p.toLowerCase() !== "unnamed");
    return parts.join(" ") || "Tài khoản Telegram";
  };

  const displayName = account ? getDisplayName(account.firstName, account.lastName) : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="solar:user-id-line-duotone" className="text-xl text-vanixjnk" />
              <span>Chi tiết tài khoản Telegram</span>
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết và thống kê thời gian thực của tài khoản.
            </DialogDescription>
          </DialogHeader>

          {account && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
                {account.avatar ? (
                  <img
                    src={account.avatar}
                    alt={displayName}
                    className="size-14 rounded-full object-cover border border-vanixjnk/20"
                  />
                ) : (
                  <div className="size-14 rounded-full bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 flex items-center justify-center">
                    <Icon icon="solar:user-bold-duotone" className="size-7 text-vanixjnk/75" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate text-base">
                    {displayName}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{account.phone}</p>
                  {account.username && (
                    <p className="text-xs text-vanixjnk font-medium mt-0.5">@{account.username}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge
                    variant={account.status === "active" ? "success" : "secondary"}
                    className="text-[10px] font-bold"
                  >
                    {account.status === "active" ? "Đã kết nối" : "Ngắt kết nối"}
                  </Badge>
                </div>
              </div>

              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Icon icon="solar:restart-line-duotone" className="size-8 text-vanixjnk animate-spin" />
                  <span className="text-xs text-muted-foreground">Đang tải thống kê thời gian thực...</span>
                </div>
              ) : detailStats ? (
                <>
                  {detailStats.isRestricted && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex gap-2 items-start">
                      <Icon icon="solar:danger-triangle-line-duotone" className="text-base shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold">Tài khoản bị Telegram hạn chế (Restricted)</span>
                        <p className="opacity-90">Lý do: {detailStats.restrictionReason || "Không rõ"}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl border flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Trạng thái tự động
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className={cn(
                            "size-2 rounded-full",
                            detailStats.isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
                          )}
                        />
                        <span className="text-xs font-bold text-foreground">
                          {detailStats.isOnline ? "Đang chạy ngầm" : "Ngoại tuyến / Tắt"}
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
                            detailStats.isPremium
                              ? "solar:star-fall-minimalistic-line-duotone"
                              : "solar:user-line-duotone"
                          }
                          className={cn(
                            "size-4",
                            detailStats.isPremium ? "text-amber-500 animate-bounce" : "text-muted-foreground"
                          )}
                        />
                        <span className="text-xs font-bold text-foreground">
                          {detailStats.isPremium ? "Telegram Premium" : "Tài khoản thường"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Nhóm đã tham gia
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg font-extrabold text-foreground">
                          {detailStats.groupsCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground">nhóm</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Kênh đã tham gia
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg font-extrabold text-foreground">
                          {detailStats.channelsCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground">kênh</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Hội thoại chat cá nhân
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg font-extrabold text-foreground">
                          {detailStats.usersCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground">cuộc hội thoại</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Tin nhắn chưa đọc
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span
                          className={cn(
                            "text-lg font-extrabold",
                            detailStats.unreadCount > 0 ? "text-rose-500" : "text-foreground"
                          )}
                        >
                          {detailStats.unreadCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground">tin nhắn</span>
                      </div>
                    </div>
                  </div>

                  {(detailStats.groups?.length > 0 || detailStats.channels?.length > 0) && (
                    <div className="space-y-3.5 border rounded-xl p-3 bg-muted/10">
                      <div className="flex gap-4 border-b border-border/60 pb-1.5">
                        <button
                          type="button"
                          className={cn(
                            "pb-1.5 px-0.5 text-xs font-bold border-b-2 transition-all cursor-pointer",
                            activeTab === "groups"
                              ? "border-vanixjnk text-vanixjnk"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setActiveTab("groups")}
                        >
                          Nhóm ({detailStats.groupsCount})
                        </button>
                        <button
                          type="button"
                          className={cn(
                            "pb-1.5 px-0.5 text-xs font-bold border-b-2 transition-all cursor-pointer",
                            activeTab === "channels"
                              ? "border-vanixjnk text-vanixjnk"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => setActiveTab("channels")}
                        >
                          Kênh ({detailStats.channelsCount})
                        </button>
                      </div>

                      <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1.5">
                        {activeTab === "groups" ? (
                          detailStats.groups?.length > 0 ? (
                            detailStats.groups.map((g: any) => {
                              const cleanTitle = g.title
                                ?.replace(/Unnamed Group/gi, "Nhóm chưa đặt tên")
                                ?.replace(/Unnamed Chat/gi, "Trò chuyện chưa đặt tên")
                                ?.replace(/Unnamed/gi, "Nhóm chưa đặt tên");
                              return (
                                <div
                                  key={g.id}
                                  className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                                  onClick={() => {
                                    setSelectedChatId(g.id);
                                    setIsChatDetailsOpen(true);
                                  }}
                                >
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-semibold text-foreground truncate">{cleanTitle}</span>
                                    {g.username && (
                                      <span className="text-[10px] text-vanixjnk font-mono mt-0.5">@{g.username}</span>
                                    )}
                                  </div>
                                  {g.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">
                                      {g.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-4 text-xs text-muted-foreground">
                              Không tìm thấy nhóm nào
                            </div>
                          )
                        ) : detailStats.channels?.length > 0 ? (
                          detailStats.channels.map((c: any) => {
                            const cleanTitle = c.title
                              ?.replace(/Unnamed Channel/gi, "Kênh chưa đặt tên")
                              ?.replace(/Unnamed/gi, "Kênh chưa đặt tên");
                            return (
                              <div
                                key={c.id}
                                className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 text-xs cursor-pointer hover:bg-muted/40 transition-colors"
                                onClick={() => {
                                    setSelectedChatId(c.id);
                                    setIsChatDetailsOpen(true);
                                }}
                              >
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-foreground truncate">{cleanTitle}</span>
                                  {c.username && (
                                    <span className="text-[10px] text-vanixjnk font-mono mt-0.5">@{c.username}</span>
                                  )}
                                </div>
                                {c.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">
                                    {c.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-xs text-muted-foreground">
                            Không tìm thấy kênh nào
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  Không thể tải thống kê. Có thể tài khoản đang ngoại tuyến hoặc proxy lỗi.
                </div>
              )}

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
          )}

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

      <GroupDetailsDialog
        open={isChatDetailsOpen}
        onOpenChange={setIsChatDetailsOpen}
        accountId={account?.id || ""}
        chatId={selectedChatId || ""}
        onLeaveSuccess={() => {
          refetch();
          onLeaveChatSuccess();
        }}
      />
    </>
  );
}
