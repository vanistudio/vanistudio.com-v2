"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import QRCode from "qrcode";

interface GroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  chatId: string;
  onLeaveSuccess: () => void;
}

export default function GroupDetailsDialog({
  open,
  onOpenChange,
  accountId,
  chatId,
  onLeaveSuccess,
}: GroupDetailsDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isConfirmLeave, setIsConfirmLeave] = useState(false);

  const { data: chatDetails, isLoading } = trpc.application.telegram.getChatDetails.useQuery(
    {
      accountId,
      chatId,
    },
    {
      enabled: !!accountId && !!chatId && open,
      refetchOnWindowFocus: false,
    }
  );

  const leaveChatMutation = trpc.application.telegram.leaveChat.useMutation({
    onSuccess: () => {
      toast.success("Đã rời khỏi nhóm/kênh thành công!");
      onOpenChange(false);
      setIsConfirmLeave(false);
      onLeaveSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Không thể rời nhóm/kênh");
    },
  });

  useEffect(() => {
    if (chatDetails?.link) {
      QRCode.toDataURL(chatDetails.link, { width: 256, margin: 1 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR:", err));
    } else {
      setQrCodeUrl(null);
    }
  }, [chatDetails?.link]);

  useEffect(() => {
    if (!open) {
      setIsConfirmLeave(false);
      setQrCodeUrl(null);
    }
  }, [open]);

  function handleCopyLink() {
    if (!chatDetails?.link) return;
    navigator.clipboard.writeText(chatDetails.link);
    toast.success("Đã sao chép liên kết vào bộ nhớ tạm!");
  }

  function handleDownloadQR() {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${chatDetails?.title || "chat"}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải QR Code thành công!");
  }

  const cleanTitle = chatDetails
    ? chatDetails.title
        ?.replace(/Unnamed Group/gi, "Nhóm chưa đặt tên")
        ?.replace(/Unnamed Channel/gi, "Kênh chưa đặt tên")
        ?.replace(/Unnamed Chat/gi, "Trò chuyện chưa đặt tên")
        ?.replace(/Unnamed/gi, "Trò chuyện chưa đặt tên")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon
              icon={
                chatDetails?.type === "channel"
                  ? "solar:bomb-emoji-line-duotone"
                  : "solar:users-group-two-rounded-line-duotone"
              }
              className="text-vanixjnk size-5"
            />
            <span>Chi tiết {chatDetails?.type === "channel" ? "Kênh" : "Nhóm"}</span>
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và quản lý cuộc hội thoại này.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Icon icon="solar:restart-line-duotone" className="size-10 text-vanixjnk animate-spin" />
            <span className="text-sm text-muted-foreground">Đang tải thông tin chi tiết...</span>
          </div>
        ) : chatDetails ? (
          <div className="space-y-6 py-2">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative size-20 rounded-full overflow-hidden border border-border shadow-md flex items-center justify-center bg-gradient-to-tr from-vanixjnk/20 to-violet-600/20 text-vanixjnk">
                {chatDetails.photoBase64 ? (
                  <img
                    src={chatDetails.photoBase64}
                    alt={cleanTitle}
                    className="size-full object-cover"
                  />
                ) : (
                  <Icon
                    icon={
                      chatDetails.type === "channel"
                        ? "solar:bomb-emoji-bold-duotone"
                        : "solar:users-group-two-rounded-bold-duotone"
                    }
                    className="size-10 text-vanixjnk/75"
                  />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground line-clamp-1">
                  {cleanTitle}
                </h3>
                <div className="flex justify-center items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {chatDetails.type === "channel" ? "Kênh Telegram" : "Nhóm Telegram"}
                  </Badge>
                  {chatDetails.participantsCount !== null && (
                    <span className="text-xs text-muted-foreground">
                      {chatDetails.participantsCount.toLocaleString()} thành viên
                    </span>
                  )}
                </div>
              </div>
            </div>

            {chatDetails.about && (
              <div className="space-y-1.5 p-3 rounded-xl border bg-muted/10">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Mô tả / Giới thiệu
                </label>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {chatDetails.about}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Liên kết & Mã QR
              </label>
              {chatDetails.link ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30 text-xs">
                    <Icon
                      icon="solar:link-round-angle-line-duotone"
                      className="size-4 text-muted-foreground shrink-0"
                    />
                    <span className="font-mono text-muted-foreground truncate flex-1">
                      {chatDetails.link}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 cursor-pointer"
                      onClick={handleCopyLink}
                    >
                      <Icon icon="solar:copy-line-duotone" className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed text-center text-xs text-muted-foreground">
                  Không có liên kết công khai (Nhóm/Kênh riêng tư).
                </div>
              )}
            </div>

            <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Vùng nguy hiểm
              </label>

              {isConfirmLeave ? (
                <div className="flex gap-2 w-full animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <Button
                    variant="destructive"
                    className="flex-1 text-xs font-bold gap-1.5 cursor-pointer"
                    disabled={leaveChatMutation.isPending}
                    onClick={() =>
                      leaveChatMutation.mutate({
                        accountId,
                        chatId: chatDetails.id,
                      })
                    }
                  >
                    {leaveChatMutation.isPending ? (
                      <Icon icon="solar:restart-line-duotone" className="size-3.5 animate-spin" />
                    ) : (
                      <Icon icon="solar:logout-line-duotone" className="size-3.5" />
                    )}
                    Xác nhận rời khỏi {chatDetails.type === "channel" ? "Kênh" : "Nhóm"}?
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs font-medium cursor-pointer"
                    onClick={() => setIsConfirmLeave(false)}
                    disabled={leaveChatMutation.isPending}
                  >
                    Hủy
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-500 border-rose-500/30 hover:border-rose-500 gap-1.5 cursor-pointer transition-all duration-200"
                  onClick={() => setIsConfirmLeave(true)}
                >
                  <Icon icon="solar:logout-line-duotone" className="size-3.5" />
                  Rời khỏi {chatDetails.type === "channel" ? "Kênh" : "Nhóm"}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
            Không thể tải chi tiết cuộc trò chuyện.
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
  );
}
