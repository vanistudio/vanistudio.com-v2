"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SettingsGeneralTab } from "./SettingsGeneralTab";
import { SettingsSeoTab } from "./SettingsSeoTab";
import { SettingsAppearanceTab } from "./SettingsAppearanceTab";
import { SettingsMaintenanceTab } from "./SettingsMaintenanceTab";
import { SettingsCustomCodesTab } from "./SettingsCustomCodesTab";

const TABS = [
  { id: "general", title: "Cấu hình chung", icon: "solar:globus-line-duotone" },
  { id: "seo", title: "SEO & Metadata", icon: "solar:magnifer-zoom-in-line-duotone" },
  { id: "appearance", title: "Giao diện & Asset", icon: "solar:palette-line-duotone" },
  { id: "maintenance", title: "Bảo trì & Thông báo", icon: "solar:shield-warning-line-duotone" },
  { id: "custom_codes", title: "Mã tùy chỉnh", icon: "solar:code-square-line-duotone" },
];

export default function AdminSettings() {
  const router = useRouter();

  const { data, isLoading, refetch, isFetching, error } = trpc.administrator.settings.get.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const updateMutation = trpc.administrator.settings.update.useMutation();
  const [activeTab, setActiveTab] = useState("general");
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [siteLogo, setSiteLogo] = useState<string | null>("");
  const [siteFavicon, setSiteFavicon] = useState<string | null>("");
  const [siteMetaDescription, setSiteMetaDescription] = useState<string | null>("");
  const [siteMetaKeywords, setSiteMetaKeywords] = useState<string | null>("");
  const [siteMetaAuthor, setSiteMetaAuthor] = useState<string | null>("");
  const [siteOgImage, setSiteOgImage] = useState<string | null>("");
  const [siteColor, setSiteColor] = useState("#7c3aed");
  const [siteTimezone, setSiteTimezone] = useState("Asia/Ho_Chi_Minh");
  const [siteLanguage, setSiteLanguage] = useState("vi");
  const [siteCurrency, setSiteCurrency] = useState("VND");
  const [sitePrimaryFont, setSitePrimaryFont] = useState("Signika");
  const [siteSecondaryFont, setSiteSecondaryFont] = useState("");
  const [siteFontWeights, setSiteFontWeights] = useState<string[]>(["400", "500", "600", "700"]);
  const [siteMaintenanceModeEnabled, setSiteMaintenanceModeEnabled] = useState(false);
  const [siteMaintenanceModeMessage, setSiteMaintenanceModeMessage] = useState("Hệ thống đang bảo trì. Vui lòng quay lại sau!");
  const [siteGlobalPopupEnabled, setSiteGlobalPopupEnabled] = useState(false);
  const [siteGlobalPopupHtmlContent, setSiteGlobalPopupHtmlContent] = useState("");
  const [siteCustomCodesHead, setSiteCustomCodesHead] = useState("");
  const [siteCustomCodesBody, setSiteCustomCodesBody] = useState("");
  const [siteCustomCodesCss, setSiteCustomCodesCss] = useState("");
  const [siteCustomCodesJs, setSiteCustomCodesJs] = useState("");

  useEffect(() => {
    if (data) {
      setSiteName(data.siteName);
      setSiteUrl(data.siteUrl);
      setSiteLogo(data.siteLogo);
      setSiteFavicon(data.siteFavicon);
      setSiteMetaDescription(data.siteMetaDescription);
      setSiteMetaKeywords(data.siteMetaKeywords);
      setSiteMetaAuthor(data.siteMetaAuthor);
      setSiteOgImage(data.siteOgImage);
      setSiteColor(data.siteColor);
      setSiteTimezone(data.siteTimezone);
      setSiteLanguage(data.siteLanguage);
      setSiteCurrency(data.siteCurrency);
      const fontConfig = (data.siteFontConfig as any) || { primaryFont: "Signika", secondaryFont: "", fontWeights: ["400", "500", "600", "700"] };
      setSitePrimaryFont(fontConfig.primaryFont || "Signika");
      setSiteSecondaryFont(fontConfig.secondaryFont || "");
      setSiteFontWeights(fontConfig.fontWeights || ["400", "500", "600", "700"]);
      const maintenance = data.siteMaintenanceMode as any;
      const popup = data.siteGlobalPopup as any;
      const codes = data.siteCustomCodes as any;
      setSiteMaintenanceModeEnabled(!!maintenance?.enabled);
      setSiteMaintenanceModeMessage(maintenance?.message || "Hệ thống đang bảo trì. Vui lòng quay lại sau!");
      setSiteGlobalPopupEnabled(!!popup?.enabled);
      setSiteGlobalPopupHtmlContent(popup?.htmlContent || "");
      setSiteCustomCodesHead(codes?.head || "");
      setSiteCustomCodesBody(codes?.body || "");
      setSiteCustomCodesCss(codes?.css || "");
      setSiteCustomCodesJs(codes?.js || "");
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Không thể tải cấu hình hệ thống");
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

  const handleSave = async () => {
    if (!data?.id) return;
    if (!siteName.trim()) {
      toast.error("Tên trang web không được để trống");
      return;
    }
    if (!siteUrl.trim()) {
      toast.error("Địa chỉ trang web không được để trống");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: data.id,
        siteName,
        siteUrl,
        siteLogo,
        siteFavicon,
        siteMetaDescription,
        siteMetaKeywords,
        siteMetaAuthor,
        siteOgImage,
        siteColor,
        siteTimezone,
        siteLanguage,
        siteCurrency,
        siteFontConfig: {
          primaryFont: sitePrimaryFont,
          secondaryFont: siteSecondaryFont,
          fontWeights: siteFontWeights,
        },
        siteMaintenanceMode: {
          enabled: siteMaintenanceModeEnabled,
          message: siteMaintenanceModeMessage,
        },
        siteGlobalPopup: {
          enabled: siteGlobalPopupEnabled,
          htmlContent: siteGlobalPopupHtmlContent,
        },
        siteCustomCodes: {
          head: siteCustomCodesHead,
          body: siteCustomCodesBody,
          css: siteCustomCodesCss,
          js: siteCustomCodesJs,
        },
      });
      toast.success("Lưu cấu hình hệ thống thành công");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu cấu hình hệ thống");
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:settings-minimalistic-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Cấu hình hệ thống</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Thiết lập các thông tin cơ bản, SEO, ngôn ngữ và giao diện của trang web.
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
                disabled={isLoading || updateMutation.isPending}
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
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          {isLoading ? (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
              <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
                <div className="pb-3">
                  <h3 className="text-base font-bold text-foreground">Danh mục cấu hình</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chọn chủ đề để điều chỉnh thông số.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
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
              <div className="lg:col-span-8 p-6">
                {activeTab === "general" && (
                  <SettingsGeneralTab
                    siteName={siteName}
                    setSiteName={setSiteName}
                    siteUrl={siteUrl}
                    setSiteUrl={setSiteUrl}
                    siteTimezone={siteTimezone}
                    setSiteTimezone={setSiteTimezone}
                    siteLanguage={siteLanguage}
                    setSiteLanguage={setSiteLanguage}
                    siteCurrency={siteCurrency}
                    setSiteCurrency={setSiteCurrency}
                  />
                )}
                {activeTab === "seo" && (
                  <SettingsSeoTab
                    siteMetaDescription={siteMetaDescription}
                    setSiteMetaDescription={setSiteMetaDescription}
                    siteMetaKeywords={siteMetaKeywords}
                    setSiteMetaKeywords={setSiteMetaKeywords}
                    siteMetaAuthor={siteMetaAuthor}
                    setSiteMetaAuthor={setSiteMetaAuthor}
                  />
                )}
                {activeTab === "appearance" && (
                  <SettingsAppearanceTab
                    siteColor={siteColor}
                    setSiteColor={setSiteColor}
                    siteLogo={siteLogo}
                    setSiteLogo={setSiteLogo}
                    siteFavicon={siteFavicon}
                    setSiteFavicon={setSiteFavicon}
                    siteOgImage={siteOgImage}
                    setSiteOgImage={setSiteOgImage}
                    sitePrimaryFont={sitePrimaryFont}
                    setSitePrimaryFont={setSitePrimaryFont}
                    siteSecondaryFont={siteSecondaryFont}
                    setSiteSecondaryFont={setSiteSecondaryFont}
                    siteFontWeights={siteFontWeights}
                    setSiteFontWeights={setSiteFontWeights}
                  />
                )}
                {activeTab === "maintenance" && (
                  <SettingsMaintenanceTab
                    siteMaintenanceModeEnabled={siteMaintenanceModeEnabled}
                    setSiteMaintenanceModeEnabled={setSiteMaintenanceModeEnabled}
                    siteMaintenanceModeMessage={siteMaintenanceModeMessage}
                    setSiteMaintenanceModeMessage={setSiteMaintenanceModeMessage}
                    siteGlobalPopupEnabled={siteGlobalPopupEnabled}
                    setSiteGlobalPopupEnabled={setSiteGlobalPopupEnabled}
                    siteGlobalPopupHtmlContent={siteGlobalPopupHtmlContent}
                    setSiteGlobalPopupHtmlContent={setSiteGlobalPopupHtmlContent}
                  />
                )}
                {activeTab === "custom_codes" && (
                  <SettingsCustomCodesTab
                    siteCustomCodesHead={siteCustomCodesHead}
                    setSiteCustomCodesHead={setSiteCustomCodesHead}
                    siteCustomCodesBody={siteCustomCodesBody}
                    setSiteCustomCodesBody={setSiteCustomCodesBody}
                    siteCustomCodesCss={siteCustomCodesCss}
                    setSiteCustomCodesCss={setSiteCustomCodesCss}
                    siteCustomCodesJs={siteCustomCodesJs}
                    setSiteCustomCodesJs={setSiteCustomCodesJs}
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
