"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ClearLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function ClearLogsDialog({
  open,
  onOpenChange,
  onConfirm,
}: ClearLogsDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setIsPending(false);
    }
  };

  const handleClear = () => {
    setIsPending(true);
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1200);
      }),
      {
        loading: "Đang xóa lịch sử hoạt động...",
        success: () => {
          onConfirm();
          handleOpenChange(false);
          return "Đã xóa toàn bộ lịch sử hoạt động!";
        },
        error: "Lỗi khi xóa lịch sử hoạt động",
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center size-12 rounded-xl text-rose-500 bg-rose-500/10 border border-rose-500/25 mb-3">
            <Icon icon="solar:trash-bin-trash-line-duotone" className="text-2xl" />
          </div>
          <DialogTitle>Xóa lịch sử hoạt động?</DialogTitle>
          <DialogDescription>
            Hành động này sẽ xóa{" "}
            <strong className="text-foreground">toàn bộ lịch sử hoạt động</strong>{" "}
            của tất cả selfbot khỏi hệ thống. Bạn không thể hoàn tác hành động này.
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
            onClick={handleClear}
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
