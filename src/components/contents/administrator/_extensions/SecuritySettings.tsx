"use client";

import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { type SecuritySettingsConfig } from "@/defaults/extension.default";

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: SecuritySettingsConfig;
  onConfigChange: (config: Partial<SecuritySettingsConfig>) => void;
}

export default function SecuritySettings({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
}: Props) {
  const handleRateLimitChange = (updates: Partial<SecuritySettingsConfig["rateLimit"]>) => {
    onConfigChange({
      rateLimit: {
        ...(config.rateLimit || { enabled: true, maxRequests: 120, windowMs: 60000 }),
        ...updates,
      },
    });
  };

  const handleIpSpamChange = (updates: Partial<SecuritySettingsConfig["ipSpamProtection"]>) => {
    onConfigChange({
      ipSpamProtection: {
        ...(config.ipSpamProtection || { enabled: true, apiSpamLimit: 5, banDurationMs: 3600000 }),
        ...updates,
      },
    });
  };

  const handleBruteForceChange = (updates: Partial<SecuritySettingsConfig["bruteForceProtection"]>) => {
    onConfigChange({
      bruteForceProtection: {
        ...(config.bruteForceProtection || { enabled: true, maxPasswordAttempts: 5, lockoutDurationMs: 900000 }),
        ...updates,
      },
    });
  };

  const handleSessionSecurityChange = (updates: Partial<SecuritySettingsConfig["sessionSecurity"]>) => {
    onConfigChange({
      sessionSecurity: {
        ...(config.sessionSecurity || { restrictMultipleSessions: false, ipChangeDetection: true, userAgentChangeDetection: true }),
        ...updates,
      },
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex items-center justify-between p-6 bg-card/30! border-border shadow-sm flex-row">
        <div className="flex flex-col gap-1 pr-4">
          <span className="text-sm font-bold text-foreground">Trạng thái kích hoạt</span>
          <span className="text-[11px] font-medium leading-tight text-muted-foreground">
            Bật hoặc tắt toàn bộ các cơ chế bảo mật bổ sung của hệ thống.
          </span>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onEnabledChange} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:clock-circle-line-duotone" className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">Giới hạn Request</span>
              <span className="text-[11px] text-muted-foreground font-medium">Cấu hình giới hạn tần suất gửi yêu cầu để chống DDoS/Spam.</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái tính năng</span>
              <div className="flex items-center justify-between pb-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Kích hoạt giới hạn</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Giới hạn tần suất request theo địa chỉ IP.</span>
                </div>
                <Switch
                  checked={config.rateLimit?.enabled ?? true}
                  onCheckedChange={(checked) => handleRateLimitChange({ enabled: checked })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Thông số giới hạn</span>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Ngưỡng chặn dải lệnh</label>
                <Input
                  type="number"
                  disabled={!(config.rateLimit?.enabled ?? true)}
                  value={config.rateLimit?.maxRequests ?? 120}
                  onChange={(e) => handleRateLimitChange({ maxRequests: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Cửa sổ nhận diện tấn công (ms)</label>
                <Input
                  type="number"
                  disabled={!(config.rateLimit?.enabled ?? true)}
                  value={config.rateLimit?.windowMs ?? 60000}
                  onChange={(e) => handleRateLimitChange({ windowMs: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={1}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:shield-warning-line-duotone" className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">Chặn Spam IP Tự động</span>
              <span className="text-[11px] text-muted-foreground font-medium">Tự động tạm chặn các địa chỉ IP có hành vi truy cập bất thường.</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái tính năng</span>
              <div className="flex items-center justify-between pb-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Kích hoạt chặn tự động</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Tự động ban IP khi vi phạm giới hạn liên tiếp.</span>
                </div>
                <Switch
                  checked={config.ipSpamProtection?.enabled ?? true}
                  onCheckedChange={(checked) => handleIpSpamChange({ enabled: checked })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Thông số cấu hình</span>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Giới hạn Spam API để khóa IP</label>
                <Input
                  type="number"
                  disabled={!(config.ipSpamProtection?.enabled ?? true)}
                  value={config.ipSpamProtection?.apiSpamLimit ?? 5}
                  onChange={(e) => handleIpSpamChange({ apiSpamLimit: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Thời gian khóa IP (ms)</label>
                <Input
                  type="number"
                  disabled={!(config.ipSpamProtection?.enabled ?? true)}
                  value={config.ipSpamProtection?.banDurationMs ?? 3600000}
                  onChange={(e) => handleIpSpamChange({ banDurationMs: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={1}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:key-minimalistic-square-line-duotone" className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">Bảo vệ Brute Force</span>
              <span className="text-[11px] text-muted-foreground font-medium">Bảo vệ tài khoản chống lại các cuộc tấn công dò mật khẩu liên tục.</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái tính năng</span>
              <div className="flex items-center justify-between pb-1">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-foreground">Kích hoạt bảo vệ</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Khóa tài khoản tạm thời khi đăng nhập sai nhiều lần.</span>
                </div>
                <Switch
                  checked={config.bruteForceProtection?.enabled ?? true}
                  onCheckedChange={(checked) => handleBruteForceChange({ enabled: checked })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Thông số cấu hình</span>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Số lần nhập sai password</label>
                <Input
                  type="number"
                  disabled={!(config.bruteForceProtection?.enabled ?? true)}
                  value={config.bruteForceProtection?.maxPasswordAttempts ?? 5}
                  onChange={(e) => handleBruteForceChange({ maxPasswordAttempts: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={1}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">Thời gian ban (ms)</label>
                <Input
                  type="number"
                  disabled={!(config.bruteForceProtection?.enabled ?? true)}
                  value={config.bruteForceProtection?.lockoutDurationMs ?? 900000}
                  onChange={(e) => handleBruteForceChange({ lockoutDurationMs: parseInt(e.target.value) || 0 })}
                  className="h-9"
                  min={1}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-6 p-6 border-border bg-card/30! shadow-sm">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Icon icon="solar:user-id-line-duotone" className="size-5.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">Bảo mật Phiên đăng nhập</span>
              <span className="text-[11px] text-muted-foreground font-medium">Bảo vệ tính toàn vẹn và ngăn chặn giả mạo/đánh cắp phiên làm việc.</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cấu hình bảo mật phiên</span>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Giới hạn đăng nhập một nơi</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Tự động đăng xuất phiên cũ khi có phiên đăng nhập mới.</span>
                  </div>
                  <Switch
                    checked={config.sessionSecurity?.restrictMultipleSessions ?? false}
                    onCheckedChange={(checked) => handleSessionSecurityChange({ restrictMultipleSessions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Phát hiện đổi IP phiên</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Yêu cầu đăng nhập lại nếu địa chỉ IP phiên bị đổi đột ngột.</span>
                  </div>
                  <Switch
                    checked={config.sessionSecurity?.ipChangeDetection ?? true}
                    onCheckedChange={(checked) => handleSessionSecurityChange({ ipChangeDetection: checked })}
                  />
                </div>

                <div className="flex items-center justify-between pb-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">Phát hiện đổi trình duyệt</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Yêu cầu đăng nhập lại nếu User-Agent thay đổi.</span>
                  </div>
                  <Switch
                    checked={config.sessionSecurity?.userAgentChangeDetection ?? true}
                    onCheckedChange={(checked) => handleSessionSecurityChange({ userAgentChangeDetection: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
