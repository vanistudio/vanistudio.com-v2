"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TIMEZONE_DATA } from "@/constants/timezones.constant";
import { LANGUAGE_DATA } from "@/constants/languages.constant";
import { CURRENCY_DATA } from "@/constants/currencies.constant";
import { cn } from "@/lib/utils";

interface SettingsGeneralTabProps {
  siteName: string;
  setSiteName: (val: string) => void;
  siteUrl: string;
  setSiteUrl: (val: string) => void;
  siteTimezone: string;
  setSiteTimezone: (val: string) => void;
  siteLanguage: string;
  setSiteLanguage: (val: string) => void;
  siteCurrency: string;
  setSiteCurrency: (val: string) => void;
}

export function SettingsGeneralTab({
  siteName,
  setSiteName,
  siteUrl,
  setSiteUrl,
  siteTimezone,
  setSiteTimezone,
  siteLanguage,
  setSiteLanguage,
  siteCurrency,
  setSiteCurrency,
}: SettingsGeneralTabProps) {
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

  return (
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
              value={siteTimezone ? `${siteTimezone} (${TIMEZONE_DATA[siteTimezone]?.country || ""} - ${TIMEZONE_DATA[siteTimezone]?.offset || ""})` : ""}
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
              value={siteLanguage ? `${LANGUAGE_DATA[siteLanguage]?.name || siteLanguage} (${siteLanguage.toUpperCase()})` : ""}
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
              value={siteCurrency ? `${CURRENCY_DATA[siteCurrency]?.name || siteCurrency} (${siteCurrency})` : ""}
              placeholder="Chọn tiền tệ..."
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
            </div>
          </div>
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
