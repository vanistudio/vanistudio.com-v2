"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
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

interface DiscordAccount {
  id: string;
  username: string;
}

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: DiscordAccount | null;
  onConfirm: () => void;
}

export default function DeleteAccountDialog({
  open,
  onOpenChange,
  account,
  onConfirm,
}: DeleteAccountDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const deleteAccountMutation = trpc.application.discord.deleteAccount.useMutation({
    onSuccess: () => {
      onConfirm();
      handleOpenChange(false);
      toast.success(`Đã xóa tài khoản Discord @${account?.username} thành công!`);
    },
    onError: (error) => {
      setIsPending(false);
      toast.error(error.message || "Lỗi khi xóa tài khoản");
    },
  });

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setIsPending(false);
    }
  };

  const handleDelete = () => {
    if (!account) return;
    setIsPending(true);
    deleteAccountMutation.mutate({ accountId: account.id });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center size-12 rounded-xl text-rose-500 bg-rose-500/10 border border-rose-500/25 mb-3">
            <Icon icon="solar:trash-bin-trash-line-duotone" className="text-2xl" />
          </div>
          <DialogTitle>Xóa tài khoản Discord?</DialogTitle>
          <DialogDescription>
            Hành động này sẽ xóa hoàn toàn thông tin Token và các cấu hình liên quan đến tài khoản{" "}
            <strong className="text-foreground">@{account?.username}</strong> khỏi hệ thống. Bạn không thể hoàn tác hành động này.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="cursor-pointer"
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="cursor-pointer"
            disabled={isPending}
          >
            {isPending && (
              <Icon
                icon="solar:restart-line-duotone"
                className="mr-1.5 size-4 animate-spin"
              />
            )}
            <span>Xác nhận xóa</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
