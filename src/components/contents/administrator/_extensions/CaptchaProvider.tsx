"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { type CaptchaConfig } from "@/defaults/extension.default";

const CAPTCHA_PROVIDERS = [
  {
    name: "Google reCAPTCHA",
    id: "siteGoogleV2",
    icon: <Icon icon="logos:google-icon" className="size-6" />,
    theme: { bg: "bg-rose-500/10", border: "border-rose-500/25", text: "text-rose-500" },
    fields: [
      { key: "siteKey", label: "Site Key", type: "text", placeholder: "Nhập Site Key của Google reCAPTCHA" },
      { key: "siteSecretKey", label: "Secret Key", type: "password", placeholder: "Nhập Secret Key của Google reCAPTCHA" },
      {
        key: "siteAppliedFunctions",
        label: "Chức năng áp dụng",
        type: "multi-select",
        options: [
          { label: "Đăng ký", value: "register" },
          { label: "Đăng nhập", value: "login" },
          { label: "Quên mật khẩu", value: "forgot-password" },
          { label: "Tạo yêu cầu hỗ trợ", value: "create-ticket" },
          { label: "Xác minh 2FA", value: "verify-2fa" },
        ]
      }
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Truy cập <a href="https://www.google.com/recaptcha/admin/create" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Google reCAPTCHA Admin</a>.</li>
        <li>Tạo site mới và chọn loại <strong>reCAPTCHA v2</strong>.</li>
        <li>Thêm tên miền hệ thống vào danh sách <strong>Domains</strong>.</li>
        <li>Sao chép <strong>Site Key</strong> và <strong>Secret Key</strong> dán vào đây.</li>
      </ul>
    )
  },
  {
    name: "Cloudflare Turnstile",
    id: "siteCloudflare",
    icon: <Icon icon="logos:cloudflare-icon" className="size-6" />,
    theme: { bg: "bg-orange-500/10", border: "border-orange-500/25", text: "text-orange-500" },
    fields: [
      { key: "siteKey", label: "Site Key", type: "text", placeholder: "Nhập Site Key của Turnstile" },
      { key: "siteSecretKey", label: "Secret Key", type: "password", placeholder: "Nhập Secret Key của Turnstile" },
      {
        key: "siteAppliedFunctions",
        label: "Chức năng áp dụng",
        type: "multi-select",
        options: [
          { label: "Đăng ký", value: "register" },
          { label: "Đăng nhập", value: "login" },
          { label: "Quên mật khẩu", value: "forgot-password" },
          { label: "Tạo yêu cầu hỗ trợ", value: "create-ticket" },
          { label: "Xác minh 2FA", value: "verify-2fa" },
        ]
      }
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Đăng nhập <a href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Cloudflare Dashboard</a>.</li>
        <li>Tìm phần <strong>Turnstile</strong> trên menu chính và thêm Site mới.</li>
        <li>Sao chép <strong>Site Key</strong> và <strong>Secret Key</strong> dán vào đây.</li>
      </ul>
    )
  },
  {
    name: "hCaptcha",
    id: "siteHCaptcha",
    icon: <Icon icon="logos:hcaptcha-icon" className="size-6" />,
    theme: { bg: "bg-[#00d4bf]/10", border: "border-[#00d4bf]/25", text: "text-[#00d4bf]" },
    fields: [
      { key: "siteKey", label: "Site Key", type: "text", placeholder: "Nhập Site Key của hCaptcha" },
      { key: "siteSecretKey", label: "Secret Key", type: "password", placeholder: "Nhập Secret Key của hCaptcha" },
      {
        key: "siteAppliedFunctions",
        label: "Chức năng áp dụng",
        type: "multi-select",
        options: [
          { label: "Đăng ký", value: "register" },
          { label: "Đăng nhập", value: "login" },
          { label: "Quên mật khẩu", value: "forgot-password" },
          { label: "Tạo yêu cầu hỗ trợ", value: "create-ticket" },
          { label: "Xác minh 2FA", value: "verify-2fa" },
        ]
      }
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Đăng nhập <a href="https://dashboard.hcaptcha.com/" target="_blank" rel="noreferrer" className="underline font-bold text-primary">hCaptcha Dashboard</a>.</li>
        <li>Tạo <strong>Site</strong> mới và điền tên miền.</li>
        <li>Sao chép <strong>Site Key</strong> và <strong>Secret Key</strong> dán vào đây.</li>
      </ul>
    )
  },
];

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: CaptchaConfig;
  onConfigChange: (config: any) => void;
  onSave?: (customConfig?: any, customEnabled?: boolean) => Promise<void>;
  isSaving?: boolean;
}

export default function CaptchaProvider({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
  onSave,
  isSaving,
}: Props) {
  const [status, setStatus] = useState<Record<string, boolean>>({
    siteGoogleV2: false,
    siteCloudflare: false,
    siteHCaptcha: false,
  });

  const [configs, setConfigs] = useState<Record<string, any>>({
    siteGoogleV2: { siteKey: "", siteSecretKey: "", siteAppliedFunctions: [] },
    siteCloudflare: { siteKey: "", siteSecretKey: "", siteAppliedFunctions: [] },
    siteHCaptcha: { siteKey: "", siteSecretKey: "", siteAppliedFunctions: [] },
  });

  const [selectedProvider, setSelectedProvider] = useState<typeof CAPTCHA_PROVIDERS[0] | null>(null);

  useEffect(() => {
    if (config) {
      setStatus({
        siteGoogleV2: config.siteGoogleV2?.siteStatus || false,
        siteCloudflare: config.siteCloudflare?.siteStatus || false,
        siteHCaptcha: config.siteHCaptcha?.siteStatus || false,
      });
      setConfigs({
        siteGoogleV2: {
          siteKey: config.siteGoogleV2?.siteKey || "",
          siteSecretKey: config.siteGoogleV2?.siteSecretKey || "",
          siteAppliedFunctions: config.siteGoogleV2?.siteAppliedFunctions || [],
        },
        siteCloudflare: {
          siteKey: config.siteCloudflare?.siteKey || "",
          siteSecretKey: config.siteCloudflare?.siteSecretKey || "",
          siteAppliedFunctions: config.siteCloudflare?.siteAppliedFunctions || [],
        },
        siteHCaptcha: {
          siteKey: config.siteHCaptcha?.siteKey || "",
          siteSecretKey: config.siteHCaptcha?.siteSecretKey || "",
          siteAppliedFunctions: config.siteHCaptcha?.siteAppliedFunctions || [],
        },
      });
    }
  }, [config]);

  const handleSave = async (updatedStatus = status, updatedConfigs = configs) => {
    const nextConfig = {
      siteGoogleV2: {
        siteStatus: updatedStatus.siteGoogleV2,
        siteKey: updatedConfigs.siteGoogleV2.siteKey,
        siteSecretKey: updatedConfigs.siteGoogleV2.siteSecretKey,
        siteAppliedFunctions: updatedConfigs.siteGoogleV2.siteAppliedFunctions,
      },
      siteCloudflare: {
        siteStatus: updatedStatus.siteCloudflare,
        siteKey: updatedConfigs.siteCloudflare.siteKey,
        siteSecretKey: updatedConfigs.siteCloudflare.siteSecretKey,
        siteAppliedFunctions: updatedConfigs.siteCloudflare.siteAppliedFunctions,
      },
      siteHCaptcha: {
        siteStatus: updatedStatus.siteHCaptcha,
        siteKey: updatedConfigs.siteHCaptcha.siteKey,
        siteSecretKey: updatedConfigs.siteHCaptcha.siteSecretKey,
        siteAppliedFunctions: updatedConfigs.siteHCaptcha.siteAppliedFunctions,
      },
    };

    onConfigChange(nextConfig);

    const anyEnabled = Object.values(updatedStatus).some(Boolean);
    if (anyEnabled !== isEnabled) {
      onEnabledChange(anyEnabled);
    }

    if (onSave) {
      await onSave(nextConfig, anyEnabled);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const newStatus = { ...status, [id]: !current };
    setStatus(newStatus);
    await handleSave(newStatus, configs);
  };

  const updateField = (providerId: string, key: string, value: any) => {
    setConfigs((p) => ({
      ...p,
      [providerId]: { ...p[providerId], [key]: value },
    }));
  };

  const handleToggleOption = (providerId: string, optionValue: string, checked: boolean) => {
    setConfigs((p) => {
      const currentFuncs = p[providerId]?.siteAppliedFunctions || [];
      let updated;
      if (checked) {
        updated = [...currentFuncs, optionValue];
      } else {
        updated = currentFuncs.filter((v: string) => v !== optionValue);
      }
      return {
        ...p,
        [providerId]: { ...p[providerId], siteAppliedFunctions: updated },
      };
    });
  };

  const handleSaveModal = async () => {
    await handleSave(status, configs);
    setSelectedProvider(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="shadow-sm border-border p-0! bg-card/30!">
        <div className="flex flex-col divide-y divide-border">
          {CAPTCHA_PROVIDERS.map((provider) => {
            const isActive = status[provider.id] || false;

            return (
              <div
                key={provider.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div
                    className={cn(
                      "flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                      provider.theme.bg,
                      provider.theme.border
                    )}
                  >
                    {provider.icon}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm truncate">{provider.name}</span>
                      <Badge
                        variant={isActive ? "success" : "danger"}
                        className="text-[10px] px-1.5 py-0 h-5 whitespace-nowrap"
                      >
                        {isActive ? "Đang bật" : "Đã tắt"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                      Cấu hình kết nối API bảo vệ cho {provider.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProvider(provider)}
                    className="h-8 text-xs font-medium w-full sm:w-auto"
                  >
                    <Icon icon="solar:settings-line-duotone" className="mr-1.5 size-4" />
                    Cấu hình
                  </Button>
                  <Button
                    variant={isActive ? "danger" : "success"}
                    size="sm"
                    onClick={() => handleToggle(provider.id, isActive)}
                    className="h-8 text-xs font-medium w-full sm:w-auto"
                    disabled={isSaving}
                  >
                    <Icon
                      icon={
                        isActive
                          ? "solar:close-circle-line-duotone"
                          : "solar:check-circle-line-duotone"
                      }
                      className="mr-1.5 size-4"
                    />
                    {isActive ? "Tắt kết nối" : "Bật kết nối"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Sheet open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
        <SheetContent className="sm:max-w-[550px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:shield-check-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              Cấu hình kết nối {selectedProvider?.name}
            </SheetTitle>
            <SheetDescription>Khai báo API Keys để xác thực bảo vệ Captcha</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex flex-col gap-5">
              {selectedProvider?.fields.map((field) => {
                if (field.type === "multi-select") {
                  return (
                    <div key={field.key} className="flex flex-col gap-3">
                      <label className="text-[13px] font-bold text-foreground">{field.label}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-xl p-4 bg-muted/20">
                        {field.options?.map((opt) => {
                          const isChecked = configs[selectedProvider.id]?.siteAppliedFunctions?.includes(
                            opt.value
                          );
                          return (
                            <div key={opt.value} className="flex flex-row items-start gap-2.5">
                              <Checkbox
                                id={`${selectedProvider.id}-${opt.value}`}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                  handleToggleOption(selectedProvider.id, opt.value, !!checked)
                                }
                                className="mt-0.5"
                              />
                              <label
                                htmlFor={`${selectedProvider.id}-${opt.value}`}
                                className="cursor-pointer text-sm font-medium leading-tight"
                              >
                                {opt.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-foreground">{field.label}</label>
                    <Input
                      placeholder={field.placeholder}
                      type={field.type}
                      value={configs[selectedProvider?.id || ""]?.[field.key] || ""}
                      onChange={(e) =>
                        selectedProvider && updateField(selectedProvider.id, field.key, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>

            {selectedProvider && (
              <div
                className={cn(
                  "px-4 py-4 rounded-xl border flex items-start gap-3 mt-2",
                  selectedProvider.theme.bg,
                  selectedProvider.theme.border,
                  selectedProvider.theme.text
                )}
              >
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className={cn("text-2xl shrink-0 mt-0.5", selectedProvider.theme.text)}
                />
                <div className="flex flex-col">
                  <span className={cn("text-[13px] font-bold", selectedProvider.theme.text)}>
                    Hướng dẫn cấu hình {selectedProvider.name}
                  </span>
                  {selectedProvider.instructions}
                </div>
              </div>
            )}
          </div>
          <div className="p-6">
            <Button
              variant="vanixjnk"
              className="w-full font-bold text-sm"
              onClick={handleSaveModal}
              disabled={isSaving}
            >
              {isSaving ? (
                <Icon icon="solar:restart-line-duotone" className="size-5 animate-spin mr-2" />
              ) : (
                <Icon icon="solar:check-circle-line-duotone" className="size-5 mr-2" />
              )}
              Lưu thay đổi thiết lập
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
