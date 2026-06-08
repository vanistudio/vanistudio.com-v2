"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ColorPicker } from "@/components/vanixjnk/color-picker";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TIMEZONE_DATA } from "@/constants/timezones.constant";
import { LANGUAGE_DATA } from "@/constants/languages.constant";
import { CURRENCY_DATA } from "@/constants/currencies.constant";

const TABS = [
  { id: "general", title: "Cấu hình chung", icon: "solar:globus-line-duotone" },
  { id: "seo", title: "SEO & Metadata", icon: "solar:magnifer-zoom-in-line-duotone" },
  { id: "appearance", title: "Giao diện & Asset", icon: "solar:palette-line-duotone" },
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

  const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");

  const filteredTimezones = Object.values(TIMEZONE_DATA).filter((tz) =>
    tz.code.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.offset.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.country.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  const filteredLanguages = Object.values(LANGUAGE_DATA).filter((lang) =>
    lang.code.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const filteredCurrencies = Object.values(CURRENCY_DATA).filter((curr) =>
    curr.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    curr.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

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
      });
      toast.success("Lưu cấu hình hệ thống thành công");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu cấu hình hệ thống");
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
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
              <div className="lg:col-span-8 p-6">
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Cấu hình chung</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Quản lý tên, múi giờ, ngôn ngữ mặc định và các cấu hình cơ bản của hệ thống.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-foreground">Tên trang web</label>
                        <Input
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          placeholder="Nhập tên trang web..."
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">Địa chỉ trang web (Site URL)</label>
                        <Input
                          value={siteUrl}
                          onChange={(e) => setSiteUrl(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>

                      <div className="space-y-2 cursor-pointer" onClick={() => setTimezoneDialogOpen(true)}>
                        <label className="text-xs font-bold text-foreground">Múi giờ hệ thống</label>
                        <div className="relative w-full">
                          {siteTimezone && TIMEZONE_DATA[siteTimezone] && (
                            <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center pointer-events-none">
                              <Icon icon={`circle-flags:${TIMEZONE_DATA[siteTimezone].flag}`} className="size-5 rounded-full" />
                            </div>
                          )}
                          <Input
                            id="siteTimezone"
                            type="text"
                            className={cn("cursor-pointer pr-10 read-only:bg-background w-full", siteTimezone && TIMEZONE_DATA[siteTimezone] && "pl-10")}
                            readOnly
                            value={siteTimezone ? `${siteTimezone} (${TIMEZONE_DATA[siteTimezone]?.country || ''} - ${TIMEZONE_DATA[siteTimezone]?.offset || ''})` : ''}
                            placeholder="Chọn múi giờ..."
                          />
                          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 cursor-pointer" onClick={() => setLanguageDialogOpen(true)}>
                        <label className="text-xs font-bold text-foreground">Ngôn ngữ mặc định</label>
                        <div className="relative w-full">
                          {siteLanguage && LANGUAGE_DATA[siteLanguage] && (
                            <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center pointer-events-none">
                              <Icon icon={`circle-flags:${LANGUAGE_DATA[siteLanguage].flag}`} className="size-5 rounded-full" />
                            </div>
                          )}
                          <Input
                            id="siteLanguage"
                            type="text"
                            className={cn("cursor-pointer pr-10 read-only:bg-background w-full", siteLanguage && LANGUAGE_DATA[siteLanguage] && "pl-10")}
                            readOnly
                            value={siteLanguage ? `${LANGUAGE_DATA[siteLanguage]?.name || siteLanguage} (${siteLanguage.toUpperCase()})` : ''}
                            placeholder="Chọn ngôn ngữ..."
                          />
                          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 cursor-pointer" onClick={() => setCurrencyDialogOpen(true)}>
                        <label className="text-xs font-bold text-foreground">Tiền tệ mặc định</label>
                        <div className="relative w-full">
                          {siteCurrency && CURRENCY_DATA[siteCurrency] && (
                            <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center pointer-events-none">
                              <Icon icon={`circle-flags:${CURRENCY_DATA[siteCurrency].flag}`} className="size-5 rounded-full" />
                            </div>
                          )}
                          <Input
                            id="siteCurrency"
                            type="text"
                            className={cn("cursor-pointer pr-10 read-only:bg-background w-full", siteCurrency && CURRENCY_DATA[siteCurrency] && "pl-10")}
                            readOnly
                            value={siteCurrency ? `${CURRENCY_DATA[siteCurrency]?.name || siteCurrency} (${siteCurrency})` : ''}
                            placeholder="Chọn tiền tệ..."
                          />
                          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "seo" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-foreground">SEO & Metadata</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cấu hình thẻ mô tả, từ khóa và các thông số phục vụ cho việc tối ưu hóa tìm kiếm.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">Mô tả trang web (Meta Description)</label>
                        <Textarea
                          value={siteMetaDescription || ""}
                          onChange={(e) => setSiteMetaDescription(e.target.value)}
                          placeholder="Mô tả trang web..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground">Từ khóa (Meta Keywords)</label>
                          <Input
                            value={siteMetaKeywords || ""}
                            onChange={(e) => setSiteMetaKeywords(e.target.value)}
                            placeholder="Từ khóa cách nhau bằng dấu phẩy..."
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground">Tác giả trang web (Meta Author)</label>
                          <Input
                            value={siteMetaAuthor || ""}
                            onChange={(e) => setSiteMetaAuthor(e.target.value)}
                            placeholder="Tên tác giả..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "appearance" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Giao diện & Asset</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tùy chỉnh màu sắc chủ đạo và các hình ảnh đại diện thương hiệu.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground">Màu chủ đạo (Theme Color)</label>
                          <ColorPicker
                            value={siteColor}
                            onChange={setSiteColor}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground">Favicon (URL)</label>
                          <Input
                            value={siteFavicon || ""}
                            onChange={(e) => setSiteFavicon(e.target.value)}
                            placeholder="/favicon.ico"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground">Logo trang web (Logo URL)</label>
                          <Input
                            value={siteLogo || ""}
                            onChange={(e) => setSiteLogo(e.target.value)}
                            placeholder="/logo.png"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground">Ảnh OpenGraph (OG Image URL)</label>
                          <Input
                            value={siteOgImage || ""}
                            onChange={(e) => setSiteOgImage(e.target.value)}
                            placeholder="Đường dẫn ảnh đại diện khi share..."
                          />
                          <p className="text-[10px] text-muted-foreground">Kích thước khuyên dùng: 1200x630px.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog open={timezoneDialogOpen} onOpenChange={setTimezoneDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn múi giờ hệ thống</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative my-3 shrink-0">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm múi giờ (ví dụ: Asia, GMT, UTC)..."
              value={timezoneSearch}
              onChange={(e) => setTimezoneSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] pr-1">
            {filteredTimezones.map((tz) => (
              <button
                key={tz.code}
                type="button"
                onClick={() => {
                  setSiteTimezone(tz.code);
                  setTimezoneDialogOpen(false);
                  setTimezoneSearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteTimezone === tz.code && "bg-accent font-medium text-vanixjnk"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon icon={`circle-flags:${tz.flag}`} className="size-5 rounded-full shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{tz.code}</span>
                    <span className="text-xs text-muted-foreground">{tz.country} - {tz.name}</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{tz.offset}</span>
              </button>
            ))}
            {filteredTimezones.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy múi giờ nào phù hợp
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn ngôn ngữ mặc định</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative my-3 shrink-0">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm ngôn ngữ (ví dụ: vi, en, tiếng việt)..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] pr-1">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSiteLanguage(lang.code);
                  setLanguageDialogOpen(false);
                  setLanguageSearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteLanguage === lang.code && "bg-accent font-medium text-vanixjnk"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon icon={`circle-flags:${lang.flag}`} className="size-5 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{lang.name}</span>
                    <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{lang.code.toUpperCase()}</span>
              </button>
            ))}
            {filteredLanguages.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy ngôn ngữ nào phù hợp
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={currencyDialogOpen} onOpenChange={setCurrencyDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn tiền tệ chính</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative my-3 shrink-0">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm tiền tệ (ví dụ: vnd, usd, peso)..."
              value={currencySearch}
              onChange={(e) => setCurrencySearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] pr-1">
            {filteredCurrencies.map((curr) => (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  setSiteCurrency(curr.code);
                  setCurrencyDialogOpen(false);
                  setCurrencySearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteCurrency === curr.code && "bg-accent font-medium text-vanixjnk"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon icon={`circle-flags:${curr.flag}`} className="size-5 rounded-full" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{curr.code}</span>
                    <span className="text-xs text-muted-foreground">{curr.name}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{curr.symbol}</span>
              </button>
            ))}
            {filteredCurrencies.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy tiền tệ nào phù hợp
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
