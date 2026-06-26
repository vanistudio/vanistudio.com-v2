"use client";

import React, { useState, useEffect } from "react";
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

interface TelegramAccount {
  id: string;
  phone: string;
  proxy: string | null;
}

interface EditProxyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: TelegramAccount | null;
  onSuccess: () => void;
}

export default function EditProxyDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
}: EditProxyDialogProps) {
  const [proxy, setProxy] = useState("");

  useEffect(() => {
    if (account) {
      setProxy(account.proxy || "");
    }
  }, [account, open]);

  const updateProxyMutation = trpc.application.telegram.updateProxy.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật Proxy thành công!");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Cập nhật Proxy thất bại");
    },
  });

  const handleUpdateProxy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    updateProxyMutation.mutate({
      accountId: account.id,
      proxy: proxy || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleUpdateProxy}>
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
              <Icon icon="solar:globus-line-duotone" className="text-2xl" />
            </div>
            <DialogTitle>Cấu hình Proxy tài khoản</DialogTitle>
            <DialogDescription>
              Thay đổi proxy gán cho tài khoản{" "}
              <strong className="text-foreground">{account?.phone}</strong>.
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="vanixjnk"
              disabled={updateProxyMutation.isPending}
              className="cursor-pointer"
            >
              {updateProxyMutation.isPending && (
                <Icon
                  icon="solar:restart-line-duotone"
                  className="mr-1.5 size-4 animate-spin"
                />
              )}
              Lưu cấu hình
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
