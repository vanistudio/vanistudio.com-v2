"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import UserRegistrationCustomizer from "./UserRegistrationCustomizer";
import OauthProviders from "./OauthProviders";
import CaptchaProvider from "./CaptchaProvider";
import AnalyticsMarketing from "./AnalyticsMarketing";
import StorageConfig from "./StorageConfig";

const TABS = [
  {
    id: "user_registration_customizer",
    title: "Tùy biến Form Đăng ký",
    icon: "solar:user-rounded-line-duotone",
    desc: "Tùy biến các trường nhập liệu và yêu cầu xác minh khi đăng ký thành viên.",
  },
  {
    id: "oauth_providers",
    title: "Social Login (OAuth)",
    icon: "solar:users-group-two-rounded-line-duotone",
    desc: "Cho phép đăng nhập nhanh thông qua Google, GitHub, Discord, GitLab.",
  },
  {
    id: "captcha_provider",
    title: "Bảo mật CAPTCHA",
    icon: "solar:shield-keyhole-line-duotone",
    desc: "Tích hợp Cloudflare Turnstile, Google reCAPTCHA để phòng chống spam & bot.",
  },
  {
    id: "analytics_marketing",
    title: "Analytics & Marketing",
    icon: "solar:chart-line-duotone",
    desc: "Theo dõi lượng truy cập và hành vi người dùng thông qua GA4, Google Ads.",
  },
  {
    id: "storage_config",
    title: "Lưu trữ & Tối ưu ảnh",
    icon: "solar:database-line-duotone",
    desc: "Cấu hình lưu trữ đám mây Cloudflare R2, Cloudinary, Tigris và tự động tối ưu hóa hình ảnh.",
  },
];

export default function AdminExtensions() {
  const { data: dbExtensions, isLoading, refetch, isFetching, error } = trpc.administrator.extensions.getAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const updateMutation = trpc.administrator.extensions.update.useMutation();
  const [activeTab, setActiveTab] = useState("user_registration_customizer");
  const [extensionsList, setExtensionsList] = useState<any[]>([]);

  useEffect(() => {
    if (dbExtensions) {
      setExtensionsList(dbExtensions);
    }
  }, [dbExtensions]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Không thể tải cấu hình gói mở rộng");
    }
  }, [error]);

  const handleReset = async () => {
    try {
      await refetch();
      toast.success("Đã làm mới dữ liệu cấu hình");
    } catch {
      toast.error("Có lỗi xảy ra khi làm mới cấu hình");
    }
  };

  const handleSave = async (customConfig?: any, customEnabled?: boolean) => {
    const activeExt = extensionsList.find((e) => e.id === activeTab);
    if (!activeExt) return;
    try {
      await updateMutation.mutateAsync({
        id: activeExt.id,
        isEnabled: customEnabled !== undefined ? customEnabled : activeExt.isEnabled,
        config: customConfig !== undefined ? customConfig : activeExt.config,
      });
      toast.success(`Lưu cấu hình gói "${activeExt.name}" thành công`);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu cấu hình");
    }
  };

  const handleConfigChange = (id: string, configUpdates: any) => {
    setExtensionsList((prev) =>
      prev.map((ext) =>
        ext.id === id
          ? {
              ...ext,
              config: {
                ...(ext.config as any),
                ...configUpdates,
              },
            }
          : ext
      )
    );
  };

  const handleEnabledChange = (id: string, isEnabled: boolean) => {
    setExtensionsList((prev) =>
      prev.map((ext) => (ext.id === id ? { ...ext, isEnabled } : ext))
    );
  };

  const activeExt = extensionsList.find((e) => e.id === activeTab);
  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:box-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Gói mở rộng</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Thiết lập và quản lý các tính năng mở rộng của hệ thống.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isLoading || isFetching || updateMutation.isPending}
                className="gap-1.5 shrink-0"
              >
                <Icon
                  icon="solar:restart-line-duotone"
                  className={isLoading || isFetching ? "animate-spin" : ""}
                />
                <span>Làm mới</span>
              </Button>
              <Button
                variant="vanixjnk"
                size="sm"
                onClick={handleSave}
                disabled={isLoading || updateMutation.isPending || !activeExt}
                className="gap-1.5 shrink-0 font-semibold"
              >
                {updateMutation.isPending ? (
                  <Icon icon="solar:restart-line-duotone" className="animate-spin text-base" />
                ) : (
                  <Icon icon="solar:diskette-line-duotone" className="text-base" />
                )}
                <span>Lưu cấu hình</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          {isLoading || !activeExt ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
              <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
                <div className="pb-3">
                  <Skeleton className="h-5 w-36 rounded" />
                  <Skeleton className="h-3.5 w-48 rounded mt-1.5" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
              <div className="lg:col-span-8 p-6 flex flex-col gap-4">
                <div className="pb-3">
                  <Skeleton className="h-5 w-44 rounded" />
                  <Skeleton className="h-3.5 w-64 rounded mt-1.5" />
                </div>
                <div className="space-y-6 mt-4">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
              {/* Sidebar */}
              <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
                <div className="pb-3">
                  <h3 className="text-base font-bold text-foreground">Danh mục tính năng</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chọn gói mở rộng muốn thiết lập cấu hình.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-vanixjnk/10 border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <Icon
                        icon={tab.icon}
                        className={`size-5 ${
                          activeTab === tab.id ? "text-vanixjnk" : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-[13px] font-bold">{tab.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="lg:col-span-8 p-6">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-foreground">{activeTabMeta?.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeTabMeta?.desc}</p>
                </div>

                {activeTab === "user_registration_customizer" && (
                  <UserRegistrationCustomizer
                    isEnabled={activeExt.isEnabled}
                    onEnabledChange={(val) => handleEnabledChange(activeExt.id, val)}
                    config={activeExt.config as any}
                    onConfigChange={(val) => handleConfigChange(activeExt.id, val)}
                  />
                )}

                {activeTab === "oauth_providers" && (
                  <OauthProviders
                    isEnabled={activeExt.isEnabled}
                    onEnabledChange={(val) => handleEnabledChange(activeExt.id, val)}
                    config={activeExt.config as any}
                    onConfigChange={(val) => handleConfigChange(activeExt.id, val)}
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                  />
                )}

                {activeTab === "captcha_provider" && (
                  <CaptchaProvider
                    isEnabled={activeExt.isEnabled}
                    onEnabledChange={(val) => handleEnabledChange(activeExt.id, val)}
                    config={activeExt.config as any}
                    onConfigChange={(val) => handleConfigChange(activeExt.id, val)}
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                  />
                )}

                {activeTab === "analytics_marketing" && (
                  <AnalyticsMarketing
                    isEnabled={activeExt.isEnabled}
                    onEnabledChange={(val) => handleEnabledChange(activeExt.id, val)}
                    config={activeExt.config as any}
                    onConfigChange={(val) => handleConfigChange(activeExt.id, val)}
                    onSave={handleSave}
                    isSaving={updateMutation.isPending}
                  />
                )}

                {activeTab === "storage_config" && (
                  <StorageConfig
                    isEnabled={activeExt.isEnabled}
                    onEnabledChange={(val) => handleEnabledChange(activeExt.id, val)}
                    config={activeExt.config as any}
                    onConfigChange={(val) => handleConfigChange(activeExt.id, val)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
