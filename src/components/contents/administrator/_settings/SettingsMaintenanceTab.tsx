"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SettingsMaintenanceTabProps {
  siteMaintenanceModeEnabled: boolean;
  setSiteMaintenanceModeEnabled: (val: boolean) => void;
  siteMaintenanceModeMessage: string;
  setSiteMaintenanceModeMessage: (val: string) => void;
  siteGlobalPopupEnabled: boolean;
  setSiteGlobalPopupEnabled: (val: boolean) => void;
  siteGlobalPopupHtmlContent: string;
  setSiteGlobalPopupHtmlContent: (val: string) => void;
}

export function SettingsMaintenanceTab({
  siteMaintenanceModeEnabled,
  setSiteMaintenanceModeEnabled,
  siteMaintenanceModeMessage,
  setSiteMaintenanceModeMessage,
  siteGlobalPopupEnabled,
  setSiteGlobalPopupEnabled,
  siteGlobalPopupHtmlContent,
  setSiteGlobalPopupHtmlContent,
}: SettingsMaintenanceTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Bảo trì & Thông báo</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quản lý trạng thái hoạt động của website và hiển thị thông báo popup toàn trang.
        </p>
      </div>

      <div className="border border-border/60 rounded-xl p-5 bg-muted/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Icon icon="solar:shield-warning-line-duotone" className="text-lg text-amber-500" />
              Chế độ bảo trì hệ thống
            </h4>
            <p className="text-xs text-muted-foreground">
              Khi bật, khách truy cập thông thường sẽ chỉ thấy màn hình bảo trì.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSiteMaintenanceModeEnabled(!siteMaintenanceModeEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              siteMaintenanceModeEnabled ? "bg-amber-500" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                siteMaintenanceModeEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className={cn("space-y-2 transition-all duration-200", !siteMaintenanceModeEnabled && "opacity-50 pointer-events-none")}>
          <label className="text-xs font-bold text-foreground">Lời nhắn hiển thị khi bảo trì</label>
          <Textarea
            value={siteMaintenanceModeMessage}
            onChange={(e) => setSiteMaintenanceModeMessage(e.target.value)}
            placeholder="Nhập thông điệp bảo trì..."
            rows={3}
            disabled={!siteMaintenanceModeEnabled}
          />
        </div>
      </div>

      <div className="border border-border/60 rounded-xl p-5 bg-muted/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Icon icon="solar:bell-line-duotone" className="text-lg text-primary" />
              Popup thông báo toàn trang
            </h4>
            <p className="text-xs text-muted-foreground">
              Hiển thị một cửa sổ popup tự động bật lên khi người dùng truy cập trang chủ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSiteGlobalPopupEnabled(!siteGlobalPopupEnabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              siteGlobalPopupEnabled ? "bg-primary" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                siteGlobalPopupEnabled ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>

        <div className={cn("space-y-2 transition-all duration-200", !siteGlobalPopupEnabled && "opacity-50 pointer-events-none")}>
          <label className="text-xs font-bold text-foreground">Nội dung Popup (Hỗ trợ HTML)</label>
          <Textarea
            value={siteGlobalPopupHtmlContent}
            onChange={(e) => setSiteGlobalPopupHtmlContent(e.target.value)}
            placeholder="Nhập mã HTML hoặc nội dung thông báo..."
            rows={6}
            disabled={!siteGlobalPopupEnabled}
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
}
