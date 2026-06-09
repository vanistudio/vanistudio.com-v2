"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { type OauthProvidersConfig } from "@/defaults/extension.default";

const OAUTH_PROVIDERS = [
  {
    name: "Google",
    id: "google",
    icon: <Icon icon="logos:google-icon" className="size-6" />,
    theme: { bg: "bg-rose-500/10", border: "border-rose-500/25", text: "text-rose-500" },
    fields: [
      { key: "clientId", label: "Client ID", type: "text", placeholder: "Nhập Client ID của Google" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Nhập Client Secret của Google" },
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Truy cập <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Google Cloud Console</a>.</li>
        <li>Tạo Project mới hoặc chọn Project hiện có.</li>
        <li>Điều hướng đến <strong>APIs & Services &gt; Credentials</strong>.</li>
        <li>Tạo <strong>OAuth client ID</strong>. Chọn Application type là <strong>Web application</strong>.</li>
        <li>Thêm Callback URL hệ thống vào mục <strong>Authorized redirect URIs</strong>.</li>
        <li>Sao chép <strong>Client ID</strong> và <strong>Client Secret</strong> dán vào đây.</li>
      </ul>
    )
  },
  {
    name: "Github",
    id: "github",
    icon: <Icon icon="logos:github-icon" className="size-6 dark:invert" />,
    theme: { bg: "bg-neutral-500/10", border: "border-neutral-500/25", text: "text-foreground" },
    fields: [
      { key: "clientId", label: "Client ID", type: "text", placeholder: "Nhập Client ID của Github" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Nhập Client Secret của Github" },
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Truy cập mục <strong>Settings &gt; Developer settings &gt; OAuth Apps</strong> trên GitHub.</li>
        <li>Bấm <strong>New OAuth App</strong>.</li>
        <li>Điền thông tin và khai báo <strong>Authorization callback URL</strong> của hệ thống.</li>
        <li>Bấm <strong>Register application</strong>.</li>
        <li>Tạo mới Client Secret. Sao chép <strong>Client ID</strong> và <strong>Client Secret</strong> dán vào đây.</li>
      </ul>
    )
  },
  {
    name: "Discord",
    id: "discord",
    icon: <Icon icon="logos:discord-icon" className="size-6" />,
    theme: { bg: "bg-indigo-500/10", border: "border-indigo-500/25", text: "text-indigo-500" },
    fields: [
      { key: "clientId", label: "Client ID", type: "text", placeholder: "Nhập Client ID của Discord" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Nhập Client Secret của Discord" },
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Truy cập <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Discord Developer Portal</a>.</li>
        <li>Bấm <strong>New Application</strong> và đặt tên cho ứng dụng.</li>
        <li>Sang tab <strong>OAuth2</strong>.</li>
        <li>Thêm Redirect (Callback URL) của hệ thống vào mục <strong>Redirects</strong>.</li>
        <li>Sao chép <strong>Client ID</strong> và <strong>Client Secret</strong> dán vào đây.</li>
      </ul>
    )
  },
  {
    name: "GitLab",
    id: "gitlab",
    icon: <Icon icon="logos:gitlab-icon" className="size-6" />,
    theme: { bg: "bg-orange-500/10", border: "border-orange-500/25", text: "text-orange-500" },
    fields: [
      { key: "clientId", label: "Client ID", type: "text", placeholder: "Nhập Client ID của GitLab" },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Nhập Client Secret của GitLab" },
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Đăng nhập GitLab, vào User Settings &gt; <a href="https://gitlab.com/-/profile/applications" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Applications</a>.</li>
        <li>Tên ứng dụng và đặt Redirect URI thành: <code>https://&lt;your-domain&gt;/api/auth/callback/gitlab</code>.</li>
        <li>Chọn Scope: <code>read_user</code> hoặc <code>api</code>.</li>
        <li>Sao chép <strong>Application ID</strong> (Client ID) và <strong>Secret</strong> (Client Secret) dán vào đây.</li>
      </ul>
    )
  },
];

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: OauthProvidersConfig;
  onConfigChange: (config: any) => void;
  onSave?: (customConfig?: any, customEnabled?: boolean) => Promise<void>;
  isSaving?: boolean;
}

export default function OauthProviders({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
  onSave,
  isSaving,
}: Props) {
  const [status, setStatus] = useState<Record<string, boolean>>({
    google: false,
    github: false,
    discord: false,
    gitlab: false,
  });

  const [configs, setConfigs] = useState<Record<string, any>>({
    google: { clientId: "", clientSecret: "" },
    github: { clientId: "", clientSecret: "" },
    discord: { clientId: "", clientSecret: "" },
    gitlab: { clientId: "", clientSecret: "" },
  });

  const [selectedProvider, setSelectedProvider] = useState<typeof OAUTH_PROVIDERS[0] | null>(null);

  useEffect(() => {
    if (config) {
      setStatus({
        google: config.google?.isEnabled || false,
        github: config.github?.isEnabled || false,
        discord: config.discord?.isEnabled || false,
        gitlab: config.gitlab?.isEnabled || false,
      });
      setConfigs({
        google: {
          clientId: config.google?.clientId || "",
          clientSecret: config.google?.clientSecret || "",
        },
        github: {
          clientId: config.github?.clientId || "",
          clientSecret: config.github?.clientSecret || "",
        },
        discord: {
          clientId: config.discord?.clientId || "",
          clientSecret: config.discord?.clientSecret || "",
        },
        gitlab: {
          clientId: config.gitlab?.clientId || "",
          clientSecret: config.gitlab?.clientSecret || "",
        },
      });
    }
  }, [config]);

  const handleSave = async (updatedStatus = status, updatedConfigs = configs) => {
    const nextConfig = {
      google: {
        isEnabled: updatedStatus.google,
        clientId: updatedConfigs.google.clientId,
        clientSecret: updatedConfigs.google.clientSecret,
      },
      github: {
        isEnabled: updatedStatus.github,
        clientId: updatedConfigs.github.clientId,
        clientSecret: updatedConfigs.github.clientSecret,
      },
      discord: {
        isEnabled: updatedStatus.discord,
        clientId: updatedConfigs.discord.clientId,
        clientSecret: updatedConfigs.discord.clientSecret,
      },
      gitlab: {
        isEnabled: updatedStatus.gitlab,
        clientId: updatedConfigs.gitlab.clientId,
        clientSecret: updatedConfigs.gitlab.clientSecret,
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

  const handleSaveModal = async () => {
    await handleSave(status, configs);
    setSelectedProvider(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="shadow-sm border-border p-0! bg-card/30!">
        <div className="flex flex-col divide-y divide-border">
          {OAUTH_PROVIDERS.map((provider) => {
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
                      Cấu hình kết nối API đăng nhập qua {provider.name}
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
              <Icon icon="solar:users-group-two-rounded-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              Cấu hình kết nối {selectedProvider?.name}
            </SheetTitle>
            <SheetDescription>Khai báo API Credentials để thiết lập Social Login</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex flex-col gap-5">
              {selectedProvider?.fields.map((field) => {
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
