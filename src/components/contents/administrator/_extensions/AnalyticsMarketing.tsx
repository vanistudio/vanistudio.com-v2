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
import { type AnalyticsMarketingConfig } from "@/defaults/extension.default";

const ANALYTICS_MARKETING_TOOLS = [
  {
    name: "Google Analytics (GA4)",
    id: "googleAnalytics",
    icon: <Icon icon="logos:google-analytics" className="size-6" />,
    theme: { bg: "bg-amber-500/10", border: "border-amber-500/25", text: "text-amber-600 dark:text-amber-400" },
    fields: [
      { key: "measurementId", label: "Measurement ID (Mã đo lường)", type: "text", placeholder: "Nhập mã đo lường G-XXXXXX" },
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Truy cập <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Google Analytics</a>.</li>
        <li>Tạo luồng dữ liệu (Data Stream) cho trang web của bạn.</li>
        <li>Sao chép <strong>Mã đo lường (Measurement ID)</strong> có định dạng <code>G-XXXXXXXXXX</code> dán vào đây.</li>
      </ul>
    )
  },
  {
    name: "Google Ads Remarketing",
    id: "googleAdsRemarketing",
    icon: <Icon icon="logos:google-adwords" className="size-6" />,
    theme: { bg: "bg-blue-500/10", border: "border-blue-500/25", text: "text-blue-500" },
    fields: [
      { key: "conversionId", label: "Conversion ID (ID chuyển đổi)", type: "text", placeholder: "AW-XXXXXX" },
      { key: "label", label: "Conversion Label (Nhãn chuyển đổi - Không bắt buộc)", type: "text", placeholder: "Nhập nhãn chuyển đổi..." },
    ],
    instructions: (
      <ul className="text-[12px] font-medium opacity-90 leading-snug list-disc pl-4 mt-1 flex flex-col gap-1">
        <li>Đăng nhập <a href="https://ads.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Google Ads</a>.</li>
        <li>Vào phần Công cụ và Cài đặt (Tools & Settings) &gt; Trình quản lý đối tượng (Audience Manager).</li>
        <li>Thiết lập nguồn dữ liệu đối tượng và lấy thẻ Google Ads.</li>
        <li>Sao chép <strong>Conversion ID (ID chuyển đổi)</strong> và <strong>Conversion Label (Nhãn chuyển đổi)</strong> dán vào đây.</li>
      </ul>
    )
  },
];

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: AnalyticsMarketingConfig;
  onConfigChange: (config: any) => void;
  onSave?: (customConfig?: any, customEnabled?: boolean) => Promise<void>;
  isSaving?: boolean;
}

export default function AnalyticsMarketing({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
  onSave,
  isSaving,
}: Props) {
  const [status, setStatus] = useState<Record<string, boolean>>({
    googleAnalytics: false,
    googleAdsRemarketing: false,
  });

  const [configs, setConfigs] = useState<Record<string, any>>({
    googleAnalytics: { measurementId: "" },
    googleAdsRemarketing: { conversionId: "", label: "" },
  });

  const [selectedTool, setSelectedTool] = useState<typeof ANALYTICS_MARKETING_TOOLS[0] | null>(null);

  useEffect(() => {
    if (config) {
      setStatus({
        googleAnalytics: config.googleAnalytics?.isEnabled || false,
        googleAdsRemarketing: config.googleAdsRemarketing?.isEnabled || false,
      });
      setConfigs({
        googleAnalytics: {
          measurementId: config.googleAnalytics?.measurementId || "",
        },
        googleAdsRemarketing: {
          conversionId: config.googleAdsRemarketing?.conversionId || "",
          label: config.googleAdsRemarketing?.label || "",
        },
      });
    }
  }, [config]);

  const handleSave = async (updatedStatus = status, updatedConfigs = configs) => {
    const nextConfig = {
      googleAnalytics: {
        isEnabled: updatedStatus.googleAnalytics,
        measurementId: updatedConfigs.googleAnalytics.measurementId,
      },
      googleAdsRemarketing: {
        isEnabled: updatedStatus.googleAdsRemarketing,
        conversionId: updatedConfigs.googleAdsRemarketing.conversionId,
        label: updatedConfigs.googleAdsRemarketing.label,
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

  const updateField = (toolId: string, key: string, value: any) => {
    setConfigs((p) => ({
      ...p,
      [toolId]: { ...p[toolId], [key]: value },
    }));
  };

  const handleSaveModal = async () => {
    await handleSave(status, configs);
    setSelectedTool(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="shadow-sm border-border p-0! bg-card/30!">
        <div className="flex flex-col divide-y divide-border">
          {ANALYTICS_MARKETING_TOOLS.map((tool) => {
            const isActive = status[tool.id] || false;

            return (
              <div
                key={tool.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div
                    className={cn(
                      "flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                      tool.theme.bg,
                      tool.theme.border
                    )}
                  >
                    {tool.icon}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm truncate">{tool.name}</span>
                      <Badge
                        variant={isActive ? "success" : "danger"}
                        className="text-[10px] px-1.5 py-0 h-5 whitespace-nowrap"
                      >
                        {isActive ? "Đang bật" : "Đã tắt"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                      Cấu hình tích hợp và theo dõi dữ liệu của {tool.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTool(tool)}
                    className="h-8 text-xs font-medium w-full sm:w-auto"
                  >
                    <Icon icon="solar:settings-line-duotone" className="mr-1.5 size-4" />
                    Cấu hình
                  </Button>
                  <Button
                    variant={isActive ? "danger" : "success"}
                    size="sm"
                    onClick={() => handleToggle(tool.id, isActive)}
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

      <Sheet open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <SheetContent className="sm:max-w-[550px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:graph-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              Cấu hình kết nối {selectedTool?.name}
            </SheetTitle>
            <SheetDescription>Khai báo API Keys để thiết lập đo lường lưu lượng</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex flex-col gap-5">
              {selectedTool?.fields.map((field) => {
                return (
                  <div key={field.key} className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-foreground">{field.label}</label>
                    <Input
                      placeholder={field.placeholder}
                      type={field.type}
                      value={configs[selectedTool?.id || ""]?.[field.key] || ""}
                      onChange={(e) =>
                        selectedTool && updateField(selectedTool.id, field.key, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>

            {selectedTool && (
              <div
                className={cn(
                  "px-4 py-4 rounded-xl border flex items-start gap-3 mt-2",
                  selectedTool.theme.bg,
                  selectedTool.theme.border,
                  selectedTool.theme.text
                )}
              >
                <Icon
                  icon="solar:info-circle-line-duotone"
                  className={cn("text-2xl shrink-0 mt-0.5", selectedTool.theme.text)}
                />
                <div className="flex flex-col">
                  <span className={cn("text-[13px] font-bold", selectedTool.theme.text)}>
                    Hướng dẫn cấu hình {selectedTool.name}
                  </span>
                  {selectedTool.instructions}
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
