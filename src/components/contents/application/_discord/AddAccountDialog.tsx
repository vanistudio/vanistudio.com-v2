"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddAccountDialogProps) {
  const [newToken, setNewToken] = useState("");
  const [newProxy, setNewProxy] = useState("");
  const [newGroup, setNewGroup] = useState("Mặc định");

  const createAccountMutation = trpc.application.discord.createAccount.useMutation({
    onSuccess: () => {
      onSuccess();
      handleOpenChange(false);
      toast.success("Đã liên kết tài khoản Discord thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Xác thực Discord thất bại");
    },
  });

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setNewToken("");
      setNewProxy("");
      setNewGroup("Mặc định");
      createAccountMutation.reset();
    }
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken) {
      toast.error("Vui lòng nhập Token Discord");
      return;
    }

    createAccountMutation.mutate({
      token: newToken,
      proxy: newProxy || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleAddAccountSubmit}>
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
              <Icon icon="solar:user-plus-line-duotone" className="text-2xl" />
            </div>
            <DialogTitle>Thêm tài khoản Discord</DialogTitle>
            <DialogDescription>
              Nhập Discord User Token để liên kết tài khoản selfbot vào hệ thống.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Discord Token (Bắt buộc)</span>
                <a
                  href="https://github.com/mmo-bot/docs/blob/main/discord-token.md"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-vanixjnk hover:underline lowercase font-normal"
                >
                  Cách lấy token?
                </a>
              </label>
              <Input
                placeholder="Mã token ví dụ: MTk4..."
                value={newToken}
                onChange={(e) => setNewToken(e.target.value)}
                className="h-9 text-[13px]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Proxy SOCKS5/HTTP (Tùy chọn)
              </label>
              <Input
                placeholder="Ví dụ: socks5://username:password@ip:port"
                value={newProxy}
                onChange={(e) => setNewProxy(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Nhóm tài khoản (Phân loại)
              </label>
              <Input
                placeholder="Ví dụ: Farm Spammer, Nick Chính"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>

            <div className="p-3.5 rounded-lg border border-yellow-500/25 bg-yellow-500/10 flex gap-3 text-xs leading-relaxed text-yellow-600 dark:text-yellow-400">
              <Icon icon="solar:danger-triangle-line-duotone" className="size-5 shrink-0 mt-0.5" />
              <p>
                <strong>Chú ý:</strong> Sử dụng selfbot có nguy cơ bị Discord quét và khóa tài khoản. Hãy gắn kèm Proxy riêng biệt cho mỗi token để giảm thiểu rủi ro bị quét chéo IP.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer"
              disabled={createAccountMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="vanixjnk"
              disabled={createAccountMutation.isPending}
              className="cursor-pointer"
            >
              {createAccountMutation.isPending ? (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
              )}
              <span>Thêm tài khoản</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
