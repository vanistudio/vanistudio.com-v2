"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  username: string;
  proxy: string | null;
}

interface EditProxyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: DiscordAccount | null;
  onSuccess: (proxyValue: string) => void;
}

export default function EditProxyDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
}: EditProxyDialogProps) {
  const [proxy, setProxy] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (account) {
      setProxy(account.proxy || "");
    }
  }, [account, open]);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setIsPending(false);
    }
  };

  const handleUpdateProxy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setIsPending(true);
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(proxy);
        }, 1200);
      }),
      {
        loading: `Đang lưu cấu hình proxy cho @${account.username}...`,
        success: (savedProxy: any) => {
          onSuccess(savedProxy);
          handleOpenChange(false);
          return "Cập nhật Proxy thành công!";
        },
        error: "Lỗi kết nối proxy",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleUpdateProxy}>
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
              <Icon icon="solar:globus-line-duotone" className="text-2xl" />
            </div>
            <DialogTitle>Cấu hình Proxy tài khoản</DialogTitle>
            <DialogDescription>
              Thay đổi proxy gán cho tài khoản{" "}
              <strong className="text-foreground">@{account?.username}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Địa chỉ Proxy
              </label>
              <Input
                placeholder="Ví dụ: socks5://username:password@ip:port"
                value={proxy}
                onChange={(e) => setProxy(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic leading-normal">
              * Để trống nếu bạn muốn tài khoản này kết nối trực tiếp bằng IP của máy chủ host.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer"
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="vanixjnk"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending && (
                <Icon
                  icon="solar:restart-line-duotone"
                  className="mr-1.5 size-4 animate-spin"
                />
              )}
              <span>Lưu cấu hình</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
