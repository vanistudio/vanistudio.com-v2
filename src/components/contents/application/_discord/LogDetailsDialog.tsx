"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

interface LogDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: {
    id: string;
    accountId: string;
    username: string;
    avatar: string | null;
    actionType: string;
    status: string;
    message: string;
    details: string;
    createdAt: string;
  } | null;
  siteTimezone: string;
  getActionBadge: (action: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}

export default function LogDetailsDialog({
  open,
  onOpenChange,
  log,
  siteTimezone,
  getActionBadge,
  getStatusBadge,
}: LogDetailsDialogProps) {
  if (!log) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0">
              <Icon icon="solar:document-text-line-duotone" className="size-5" />
            </div>
            Chi tiết nhật ký hoạt động
          </DialogTitle>
          <DialogDescription className="text-left mt-1 text-[13px]">
            Xem dữ liệu JSON đầu vào/đầu ra của tiến trình tự động hóa selfbot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tài khoản thực thi
              </span>
              <span className="font-bold text-foreground text-sm">@{log.username}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Thời gian
              </span>
              <span className="text-foreground text-sm font-mono">
                {formatWithSiteTimezone(log.createdAt, siteTimezone, "DD/MM/YYYY HH:mm:ss")}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Loại hành động
              </span>
              <span className="mt-0.5">{getActionBadge(log.actionType)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Trạng thái
              </span>
              <span className="mt-0.5">{getStatusBadge(log.status)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Thông báo tóm tắt
            </span>
            <p className="text-xs text-foreground bg-muted p-2.5 rounded border border-border leading-relaxed font-semibold">
              {log.message}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Dữ liệu chi tiết (Log payload)
            </span>
            <pre className="text-[11px] font-mono text-foreground bg-muted p-3 rounded border border-border overflow-x-auto max-h-[220px]">
              {log.details}
            </pre>
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
