"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useSetting } from "@/contexts/SettingContext";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TIMEZONE_DATA } from "@/constants/timezones.constant";
import { LANGUAGE_DATA } from "@/constants/languages.constant";
import { CURRENCY_DATA } from "@/constants/currencies.constant";
import { useTheme } from "next-themes";

export default function AdminFooter() {
  const setting = useSetting();
  const currentYear = new Date().getFullYear();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const [mounted, setMounted] = useState(false);
  const [siteTimezone, setSiteTimezone] = useState("Asia/Ho_Chi_Minh");
  const [siteLanguage, setSiteLanguage] = useState("vi");
  const [siteCurrency, setSiteCurrency] = useState("VND");

  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");

  const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [currencyDialogOpen, setCurrencyDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (setting) {
      if (setting.siteTimezone) setSiteTimezone(setting.siteTimezone);
      if (setting.siteLanguage) setSiteLanguage(setting.siteLanguage);
      if (setting.siteCurrency) setSiteCurrency(setting.siteCurrency);
    }
    const savedTimezone = localStorage.getItem("client_timezone");
    const savedLanguage = localStorage.getItem("client_language");
    const savedCurrency = localStorage.getItem("client_currency");
    if (savedTimezone) setSiteTimezone(savedTimezone);
    if (savedLanguage) setSiteLanguage(savedLanguage);
    if (savedCurrency) setSiteCurrency(savedCurrency);
  }, [setting]);

  const handleTimezoneChange = (code: string) => {
    setSiteTimezone(code);
    localStorage.setItem("client_timezone", code);
  };

  const handleLanguageChange = (code: string) => {
    setSiteLanguage(code);
    localStorage.setItem("client_language", code);
  };

  const handleCurrencyChange = (code: string) => {
    setSiteCurrency(code);
    localStorage.setItem("client_currency", code);
  };

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
    <footer className="relative w-full bg-background mt-auto overflow-hidden">
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
      <div className="w-full">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 border-l border-r border-dashed border-primary/20">

            <div className="relative p-6 md:p-8 md:pr-10 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-dashed border-primary/20">
              <Link href="/" className="flex items-center gap-2 group self-start">
                <img
                  src={setting?.siteLogo || "/vani-1.png"}
                  alt="Logo"
                  className="h-9 w-auto object-contain rounded-lg"
                />
              </Link>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Kiến tạo giải pháp công nghệ vượt trội: thiết kế Website chuyên nghiệp, phát triển ứng dụng di động, giải pháp Chatbot AI và giao diện UI/UX tối ưu trải nghiệm.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href="#"
                  className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 border border-dashed border-primary/20"
                  title="Facebook"
                >
                  <Icon icon="solar:globus-line-duotone" className="text-lg" />
                </a>
                <a
                  href="#"
                  className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 border border-dashed border-primary/20"
                  title="GitHub"
                >
                  <Icon icon="solar:code-line-duotone" className="text-lg" />
                </a>
                <a
                  href="#"
                  className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 border border-dashed border-primary/20"
                  title="Zalo"
                >
                  <Icon icon="solar:chat-round-line-duotone" className="text-lg" />
                </a>
              </div>
            </div>

            <div className="relative p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-dashed border-primary/20">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase mb-5 select-none">
                Dịch vụ chính
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/services/website" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Thiết kế Website
                  </Link>
                </li>
                <li>
                  <Link href="/services/mobile" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Ứng dụng di động
                  </Link>
                </li>
                <li>
                  <Link href="/services/chatbot" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Trợ lý ảo AI Chatbot
                  </Link>
                </li>
                <li>
                  <Link href="/services/ui-ux" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Thiết kế UI/UX
                  </Link>
                </li>
              </ul>
            </div>

            <div className="relative p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-dashed border-primary/20">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase mb-5 select-none">
                Khám phá
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/projects" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Dự án đã thực hiện
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Sản phẩm phần mềm
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Blog & Tin công nghệ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[13px] text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group">
                    <Icon icon="solar:round-alt-arrow-right-line-duotone" className="text-sm text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    Liên hệ báo giá
                  </Link>
                </li>
              </ul>
            </div>

            <div className="relative p-6 md:p-8 flex flex-col gap-4">
              <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground/80 uppercase mb-1 select-none">
                Kết nối với chúng tôi
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[13px] text-muted-foreground">
                  <div className="size-6 rounded-md flex items-center justify-center text-primary bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                    <Icon icon="solar:letter-line-duotone" className="text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase select-none">Email</span>
                    <span className="hover:text-primary transition-colors cursor-pointer text-foreground font-medium">contact@vanistudio.com</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-muted-foreground">
                  <div className="size-6 rounded-md flex items-center justify-center text-primary bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                    <Icon icon="solar:phone-line-duotone" className="text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase select-none">Hotline</span>
                    <span className="hover:text-primary transition-colors cursor-pointer text-foreground font-medium">+84 123 456 789</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-[13px] text-muted-foreground">
                  <div className="size-6 rounded-md flex items-center justify-center text-primary bg-primary/10 border border-primary/20 shrink-0 mt-0.5">
                    <Icon icon="solar:map-point-line-duotone" className="text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono tracking-wider text-muted-foreground/50 uppercase select-none">Địa chỉ</span>
                    <span className="text-foreground leading-relaxed font-medium">Thủ Đức, TP. Hồ Chí Minh</span>
                  </div>
                </li>
              </ul>
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

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <p className="text-[11px] text-muted-foreground font-mono select-none">
              © {currentYear} VANI STUDIO. ALL RIGHTS RESERVED.
            </p>
            <div className="hidden sm:flex items-center gap-3 font-mono text-[10px] tracking-wider text-muted-foreground/40">
              <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
                PRIVACY POLICY
              </Link>
              <span className="select-none">/</span>
              <Link href="/terms" className="hover:text-primary transition-colors duration-200">
                TERMS OF SERVICE
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {mounted && LANGUAGE_DATA[siteLanguage] && (
              <button
                type="button"
                onClick={() => setLanguageDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary/40 text-xs transition-all duration-200 cursor-pointer"
              >
                <Icon icon={`circle-flags:${LANGUAGE_DATA[siteLanguage].flag}`} className="size-4 rounded-full shrink-0" />
                <span className="font-mono text-[10px] tracking-wider uppercase font-medium">{LANGUAGE_DATA[siteLanguage].name}</span>
              </button>
            )}

            {mounted && CURRENCY_DATA[siteCurrency] && (
              <button
                type="button"
                onClick={() => setCurrencyDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary/40 text-xs transition-all duration-200 cursor-pointer"
              >
                <Icon icon={`circle-flags:${CURRENCY_DATA[siteCurrency].flag}`} className="size-4 rounded-full shrink-0" />
                <span className="font-mono text-[10px] tracking-wider uppercase font-medium">
                  {siteCurrency} ({CURRENCY_DATA[siteCurrency].symbol})
                </span>
              </button>
            )}

            {mounted && TIMEZONE_DATA[siteTimezone] && (
              <button
                type="button"
                onClick={() => setTimezoneDialogOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary/40 text-xs transition-all duration-200 cursor-pointer"
              >
                <Icon icon={`circle-flags:${TIMEZONE_DATA[siteTimezone].flag}`} className="size-4 rounded-full shrink-0" />
                <span className="font-mono text-[10px] tracking-wider uppercase font-medium">
                  {TIMEZONE_DATA[siteTimezone].offset}
                </span>
              </button>
            )}

            {mounted && (
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center size-8 rounded-lg border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-200 cursor-pointer"
                title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
              >
                {theme === "dark" ? (
                  <Icon icon="solar:sun-2-line-duotone" className="size-4.5" />
                ) : (
                  <Icon icon="solar:moon-line-duotone" className="size-4.5" />
                )}
              </button>
            )}
          </div>

          <div className="flex sm:hidden items-center gap-5 font-mono text-[10px] tracking-wider text-muted-foreground/60">
            <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
              PRIVACY POLICY
            </Link>
            <span className="text-border/40 select-none">/</span>
            <Link href="/terms" className="hover:text-primary transition-colors duration-200">
              TERMS OF SERVICE
            </Link>
          </div>
        </div>
      </div>
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-primary bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn ngôn ngữ hiển thị</span>
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
                  handleLanguageChange(lang.code);
                  setLanguageDialogOpen(false);
                  setLanguageSearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteLanguage === lang.code && "bg-accent font-medium text-primary"
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
              <div className="size-8 rounded-full text-primary bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn tiền tệ thanh toán</span>
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
                  handleCurrencyChange(curr.code);
                  setCurrencyDialogOpen(false);
                  setCurrencySearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteCurrency === curr.code && "bg-accent font-medium text-primary"
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
      <Dialog open={timezoneDialogOpen} onOpenChange={setTimezoneDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-primary bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
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
                  handleTimezoneChange(tz.code);
                  setTimezoneDialogOpen(false);
                  setTimezoneSearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  siteTimezone === tz.code && "bg-accent font-medium text-primary"
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
    </footer>
  );
}
