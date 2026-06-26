"use client";

import React from "react";
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

interface TelegramAccount {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
}

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: TelegramAccount | null;
  onSuccess: () => void;
}

export default function DeleteAccountDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
}: DeleteAccountDialogProps) {
  const deleteAccountMutation = trpc.application.telegram.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("Đã xóa tài khoản Telegram thành công!");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Xóa tài khoản thất bại");
    },
  });

  const handleDeleteAccount = () => {
    if (!account) return;
    deleteAccountMutation.mutate({
      accountId: account.id,
    });
  };

  const displayName = account
    ? [account.firstName, account.lastName]
        .filter(Boolean)
        .map((p) => p!.trim())
        .filter((p) => p.toLowerCase() !== "unnamed")
        .join(" ") || "Tài khoản Telegram"
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center size-12 rounded-xl text-rose-500 bg-rose-500/10 border border-rose-500/25 mb-3">
            <Icon icon="solar:trash-bin-trash-line-duotone" className="text-2xl" />
          </div>
          <DialogTitle>Xóa tài khoản Telegram?</DialogTitle>
          <DialogDescription>
            Hành động này sẽ ngắt kết nối và xóa thông tin phiên của tài khoản{" "}
            <strong className="text-foreground">
              {displayName} ({account?.phone})
            </strong>{" "}
            khỏi hệ thống. Bạn không thể hoàn tác hành động này.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            disabled={deleteAccountMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            className="cursor-pointer"
            disabled={deleteAccountMutation.isPending}
          >
            {deleteAccountMutation.isPending && (
              <Icon
                icon="solar:restart-line-duotone"
                className="mr-1.5 size-4 animate-spin"
              />
            )}
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
