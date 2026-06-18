"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ColorPicker } from "@/components/vanixjnk/color-picker";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { useFontStore } from "@/stores/font.store";

const GOOGLE_FONTS = [
  { family: "Inter", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Roboto", category: "sans-serif", weights: ["100","300","400","500","700","900"] },
  { family: "Open Sans", category: "sans-serif", weights: ["300","400","500","600","700","800"] },
  { family: "Signika", category: "sans-serif", weights: ["300","400","500","600","700"] },
  { family: "Montserrat", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Poppins", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Lato", category: "sans-serif", weights: ["100","300","400","700","900"] },
  { family: "Nunito", category: "sans-serif", weights: ["200","300","400","500","600","700","800","900"] },
  { family: "Nunito Sans", category: "sans-serif", weights: ["200","300","400","500","600","700","800","900"] },
  { family: "Raleway", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Ubuntu", category: "sans-serif", weights: ["300","400","500","700"] },
  { family: "Outfit", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Manrope", category: "sans-serif", weights: ["200","300","400","500","600","700","800"] },
  { family: "Work Sans", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "DM Sans", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Plus Jakarta Sans", category: "sans-serif", weights: ["200","300","400","500","600","700","800"] },
  { family: "Space Grotesk", category: "sans-serif", weights: ["300","400","500","600","700"] },
  { family: "Lexend", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Figtree", category: "sans-serif", weights: ["300","400","500","600","700","800","900"] },
  { family: "Geist", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Source Sans 3", category: "sans-serif", weights: ["200","300","400","500","600","700","800","900"] },
  { family: "Cabin", category: "sans-serif", weights: ["400","500","600","700"] },
  { family: "Quicksand", category: "sans-serif", weights: ["300","400","500","600","700"] },
  { family: "Mulish", category: "sans-serif", weights: ["200","300","400","500","600","700","800","900"] },
  { family: "Barlow", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Rubik", category: "sans-serif", weights: ["300","400","500","600","700","800","900"] },
  { family: "Karla", category: "sans-serif", weights: ["200","300","400","500","600","700","800"] },
  { family: "Josefin Sans", category: "sans-serif", weights: ["100","200","300","400","500","600","700"] },
  { family: "Overpass", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Sora", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800"] },
  { family: "Be Vietnam Pro", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Noto Sans", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "IBM Plex Sans", category: "sans-serif", weights: ["100","200","300","400","500","600","700"] },
  { family: "Exo 2", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Albert Sans", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Archivo", category: "sans-serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Red Hat Display", category: "sans-serif", weights: ["300","400","500","600","700","800","900"] },
  { family: "Playfair Display", category: "serif", weights: ["400","500","600","700","800","900"] },
  { family: "Merriweather", category: "serif", weights: ["300","400","700","900"] },
  { family: "Lora", category: "serif", weights: ["400","500","600","700"] },
  { family: "PT Serif", category: "serif", weights: ["400","700"] },
  { family: "Libre Baskerville", category: "serif", weights: ["400","700"] },
  { family: "Crimson Text", category: "serif", weights: ["400","600","700"] },
  { family: "Source Serif 4", category: "serif", weights: ["200","300","400","500","600","700","800","900"] },
  { family: "DM Serif Display", category: "serif", weights: ["400"] },
  { family: "Cormorant Garamond", category: "serif", weights: ["300","400","500","600","700"] },
  { family: "Bitter", category: "serif", weights: ["100","200","300","400","500","600","700","800","900"] },
  { family: "Fira Code", category: "monospace", weights: ["300","400","500","600","700"] },
  { family: "JetBrains Mono", category: "monospace", weights: ["100","200","300","400","500","600","700","800"] },
  { family: "Source Code Pro", category: "monospace", weights: ["200","300","400","500","600","700","800","900"] },
  { family: "Space Mono", category: "monospace", weights: ["400","700"] },
  { family: "IBM Plex Mono", category: "monospace", weights: ["100","200","300","400","500","600","700"] },
];

const WEIGHT_LABELS: Record<string, string> = {
  "100": "Thin", "200": "ExtraLight", "300": "Light", "400": "Regular",
  "500": "Medium", "600": "SemiBold", "700": "Bold", "800": "ExtraBold", "900": "Black"
};

interface SettingsAppearanceTabProps {
  siteColor: string;
  setSiteColor: (val: string) => void;
  siteLogo: string | null;
  setSiteLogo: (val: string | null) => void;
  siteFavicon: string | null;
  setSiteFavicon: (val: string | null) => void;
  siteOgImage: string | null;
  setSiteOgImage: (val: string | null) => void;
  sitePrimaryFont: string;
  setSitePrimaryFont: (val: string) => void;
  siteSecondaryFont: string;
  setSiteSecondaryFont: (val: string) => void;
  siteFontWeights: string[];
  setSiteFontWeights: (val: string[]) => void;
}

export function SettingsAppearanceTab({
  siteColor,
  setSiteColor,
  siteLogo,
  setSiteLogo,
  siteFavicon,
  setSiteFavicon,
  siteOgImage,
  setSiteOgImage,
  sitePrimaryFont,
  setSitePrimaryFont,
  siteSecondaryFont,
  setSiteSecondaryFont,
  siteFontWeights: fontWeights,
  setSiteFontWeights: setFontWeights,
}: SettingsAppearanceTabProps) {
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [activeFieldPicker, setActiveFieldPicker] = useState<"favicon" | "logo" | "ogImage" | null>(null);

  const { setPrimaryFont, setSecondaryFont } = useFontStore();

  useEffect(() => {
    if (sitePrimaryFont) {
      setPrimaryFont(sitePrimaryFont);
    }
  }, [sitePrimaryFont, setPrimaryFont]);

  useEffect(() => {
    setSecondaryFont(siteSecondaryFont);
  }, [siteSecondaryFont, setSecondaryFont]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetTarget, setSheetTarget] = useState<"primary" | "secondary">("primary");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [remoteFonts, setRemoteFonts] = useState<typeof GOOGLE_FONTS>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSelectImage = (url: string) => {
    if (activeFieldPicker === "favicon") {
      setSiteFavicon(url);
    } else if (activeFieldPicker === "logo") {
      setSiteLogo(url);
    } else if (activeFieldPicker === "ogImage") {
      setSiteOgImage(url);
    }
  };

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setRemoteFonts([]);
      return;
    }
    const localResults = GOOGLE_FONTS.filter(f => f.family.toLowerCase().includes(searchQuery.toLowerCase()));
    if (localResults.length >= 5) {
      setRemoteFonts([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBwIX97bVWr3-6AIUvGkcNnmFgirefZ-20&sort=popularity`);
        if (res.ok) {
          const data = await res.json();
          const matched = (data.items || [])
            .filter((f: any) => f.family.toLowerCase().includes(searchQuery.toLowerCase()))
            .slice(0, 30)
            .map((f: any) => ({
              family: f.family,
              category: f.category || "sans-serif",
              weights: (f.variants || [])
                .filter((v: string) => /^\d+$/.test(v) || v === "regular")
                .map((v: string) => v === "regular" ? "400" : v)
            }));
          const localFamilies = new Set(GOOGLE_FONTS.map(f => f.family));
          setRemoteFonts(matched.filter((f: any) => !localFamilies.has(f.family)));
        }
      } catch {}
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredFonts = useMemo(() => {
    const local = GOOGLE_FONTS.filter(f => {
      const matchSearch = f.family.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === "all" || f.category === categoryFilter;
      return matchSearch && matchCategory;
    });
    const remote = remoteFonts.filter(f => {
      const matchCategory = categoryFilter === "all" || f.category === categoryFilter;
      return matchCategory;
    });
    return [...local, ...remote];
  }, [searchQuery, categoryFilter, remoteFonts]);

  const allFonts = [...GOOGLE_FONTS, ...remoteFonts];
  const selectedFont = allFonts.find(f => f.family === sitePrimaryFont);
  const selectedSecondary = allFonts.find(f => f.family === siteSecondaryFont);

  const openSheet = (target: "primary" | "secondary") => {
    setSheetTarget(target);
    setSearchQuery("");
    setCategoryFilter("all");
    setIsSheetOpen(true);
  };

  const selectFont = (family: string) => {
    if (sheetTarget === "primary") {
      setSitePrimaryFont(family);
    } else {
      setSiteSecondaryFont(family);
    }
    setIsSheetOpen(false);
  };

  const toggleWeight = (weight: string) => {
    const updated = fontWeights.includes(weight)
      ? fontWeights.filter(w => w !== weight)
      : [...fontWeights, weight].sort((a, b) => Number(a) - Number(b));
    setFontWeights(updated);
  };

  const loadFontPreview = (family: string) => {
    const id = `font-preview-${family.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=swap`;
      document.head.appendChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Giao diện & Asset</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tùy chỉnh màu sắc chủ đạo và các hình ảnh đại diện thương hiệu.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Màu chủ đạo (Theme Color)</label>
            <ColorPicker value={siteColor} onChange={setSiteColor} />
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-4 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:gallery-line-duotone" className="size-4 text-muted-foreground" />
                URL Logo
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={siteLogo || ""}
                  onChange={(e) => setSiteLogo(e.target.value)}
                  placeholder="Ví dụ: https://domain.com/logo.png"
                  className="h-9 shadow-sm text-[13px] flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveFieldPicker("logo");
                    setGalleryDialogOpen(true);
                  }}
                  className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0"
                >
                  <Icon icon="solar:gallery-line-duotone" className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-center border border-border/50 rounded-xl bg-muted/10 min-h-[82px] p-2 items-center text-center">
              {siteLogo ? (
                <img
                  src={siteLogo}
                  alt="Preview Logo"
                  className="max-h-20 max-w-full object-contain drop-shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Icon icon="solar:gallery-remove-line-duotone" /> Chưa có hình ảnh
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:star-fall-line-duotone" className="size-4 text-muted-foreground" />
                URL Favicon
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={siteFavicon || ""}
                  onChange={(e) => setSiteFavicon(e.target.value)}
                  placeholder="Ví dụ: https://domain.com/favicon.ico"
                  className="h-9 shadow-sm text-[13px] flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveFieldPicker("favicon");
                    setGalleryDialogOpen(true);
                  }}
                  className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0"
                >
                  <Icon icon="solar:gallery-line-duotone" className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-center border border-border/50 rounded-xl bg-muted/10 min-h-[82px] p-2 items-center text-center">
              {siteFavicon ? (
                <img
                  src={siteFavicon}
                  alt="Preview Favicon"
                  className="max-h-20 max-w-full object-contain drop-shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Icon icon="solar:gallery-remove-line-duotone" /> Chưa có hình ảnh
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:monitor-camera-line-duotone" className="size-4 text-muted-foreground" />
                URL OG Image (Ảnh xem trước khi chia sẻ)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={siteOgImage || ""}
                  onChange={(e) => setSiteOgImage(e.target.value)}
                  placeholder="Ví dụ: https://domain.com/og-image.png"
                  className="h-9 shadow-sm text-[13px] flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveFieldPicker("ogImage");
                    setGalleryDialogOpen(true);
                  }}
                  className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0"
                >
                  <Icon icon="solar:gallery-line-duotone" className="size-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col justify-center border border-border/50 rounded-xl bg-muted/10 min-h-[82px] p-2 items-center text-center">
              {siteOgImage ? (
                <img
                  src={siteOgImage}
                  alt="Preview OG Image"
                  className="max-h-20 max-w-full object-contain drop-shadow-sm"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                  <Icon icon="solar:gallery-remove-line-duotone" /> Chưa có hình ảnh
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-6 border-t border-border/50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:text-bold-line-duotone" className="size-5 text-vanixjnk" />
              <span className="text-sm font-bold text-foreground">Phông chữ chính</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-bold">Toàn trang</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Phông chữ mặc định áp dụng cho toàn bộ nội dung website.</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openSheet("primary")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-vanixjnk/30 hover:bg-vanixjnk/5 transition-all cursor-pointer flex-1"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-vanixjnk/10 border border-vanixjnk/20 shrink-0">
                  <span className="text-lg font-bold text-vanixjnk" style={{ fontFamily: sitePrimaryFont }}>Aa</span>
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-bold text-foreground">{sitePrimaryFont}</span>
                  <span className="text-[11px] text-muted-foreground">{selectedFont?.category || "sans-serif"} • {fontWeights.length} weights</span>
                </div>
                <Icon icon="solar:pen-new-square-line-duotone" className="size-4 text-muted-foreground ml-auto" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:text-italic-line-duotone" className="size-5 text-indigo-500" />
              <span className="text-sm font-bold text-foreground">Phông chữ phụ</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-bold">Tuỳ chọn</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Phông chữ dùng cho tiêu đề, heading. Để trống nếu muốn dùng chung phông chữ chính.</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openSheet("secondary")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer flex-1"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                  <span className="text-lg font-bold text-indigo-500" style={{ fontFamily: siteSecondaryFont || sitePrimaryFont }}>Aa</span>
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-bold text-foreground">{siteSecondaryFont || "Không sử dụng"}</span>
                  <span className="text-[11px] text-muted-foreground">{selectedSecondary?.category || "Dùng chung phông chữ chính"}</span>
                </div>
                <Icon icon="solar:pen-new-square-line-duotone" className="size-4 text-muted-foreground ml-auto" />
              </button>
              {siteSecondaryFont && (
                <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-destructive" onClick={() => setSiteSecondaryFont("")}>
                  <Icon icon="solar:trash-bin-minimalistic-line-duotone" className="size-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:slider-vertical-line-duotone" className="size-5 text-emerald-500" />
              <span className="text-sm font-bold text-foreground">Độ dày chữ (Weights)</span>
            </div>
            <p className="text-xs text-muted-foreground">Chọn các mức độ dày sẽ được tải. Càng nhiều weight thì trang tải càng chậm.</p>
            <div className="flex flex-wrap gap-2">
              {(selectedFont?.weights || ["400","500","600","700"]).map(weight => (
                <label
                  key={weight}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    fontWeights.includes(weight)
                      ? "border-vanixjnk/30 bg-vanixjnk/5 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={fontWeights.includes(weight)}
                    onCheckedChange={() => toggleWeight(weight)}
                    className="size-3.5"
                  />
                  <span className="text-xs font-bold">{weight}</span>
                  <span className="text-[10px] text-muted-foreground">{WEIGHT_LABELS[weight]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Icon icon="solar:eye-line-duotone" className="size-5 text-amber-500" />
              <span className="text-sm font-bold text-foreground">Xem trước</span>
            </div>
            <div className="rounded-xl border border-border p-5 bg-muted/20 max-h-[280px] overflow-y-auto">
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: siteSecondaryFont || sitePrimaryFont }}>
                Việt Nam trong Kỷ nguyên Vươn mình 2026
              </h3>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: sitePrimaryFont }}>
                <p>
                  Năm 2026 đánh dấu bước ngoặt lịch sử khi Việt Nam chính thức bước vào kỷ nguyên vươn mình — một giai đoạn chuyển đổi toàn diện dưới sự lãnh đạo sáng suốt của Đảng Cộng sản Việt Nam. Nghị quyết Đại hội XIV đặt mục tiêu đưa đất nước trở thành quốc gia phát triển có thu nhập cao vào năm 2045, với nền tảng khoa học công nghệ và đổi mới sáng tạo làm động lực tăng trưởng chủ đạo.
                </p>
                <p>
                  <strong className="text-foreground">Kinh tế:</strong> GDP tăng trưởng ổn định trên 7%, cơ cấu kinh tế chuyển dịch mạnh sang công nghiệp chế biến chế tạo và dịch vụ số. Việt Nam trở thành trung tâm sản xuất chip bán dẫn hàng đầu Đông Nam Á, thu hút hàng tỷ USD đầu tư từ các tập đoàn công nghệ toàn cầu. Kinh tế tư nhân được khuyến khích phát triển, đóng góp trên 60% GDP.
                </p>
                <p>
                  <strong className="text-foreground">Chính trị — Nhà nước:</strong> Bộ máy hành chính tinh gọn, hiệu lực, hiệu quả sau cuộc cách mạng tinh giản biên chế. Chính phủ số vận hành trên nền tảng dữ liệu quốc gia thống nhất, mọi thủ tục hành chính được xử lý trực tuyến. Công tác phòng chống tham nhũng tiếp tục được đẩy mạnh với tinh thần "không có vùng cấm, không có ngoại lệ".
                </p>
                <p>
                  <strong className="text-foreground">Quốc phòng — An ninh:</strong> Quân đội nhân dân Việt Nam hiện đại hóa toàn diện, làm chủ công nghệ quốc phòng tiên tiến. Lực lượng tác chiến không gian mạng được nâng cấp, bảo vệ chủ quyền số quốc gia. Chính sách quốc phòng "bốn không" tiếp tục khẳng định đường lối đối ngoại hòa bình, độc lập, tự chủ.
                </p>
                <p>
                  <strong className="text-foreground">Giáo dục:</strong> Chương trình giáo dục phổ thông mới phát huy hiệu quả, tập trung phát triển tư duy phản biện và năng lực sáng tạo. Đại học Việt Nam lọt top 500 thế giới, hệ sinh thái nghiên cứu khoa học kết nối chặt chẽ với doanh nghiệp. Trí tuệ nhân tạo được tích hợp vào giảng dạy từ bậc trung học.
                </p>
                <p>
                  <strong className="text-foreground">Xã hội:</strong> An sinh xã hội toàn diện, bảo hiểm y tế phủ sóng 95% dân số. Khoảng cách giàu nghèo thu hẹp, tầng lớp trung lưu chiếm trên 50% dân số. Văn hóa Việt Nam lan tỏa mạnh mẽ ra thế giới qua âm nhạc, điện ảnh và ẩm thực.
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-border" style={{ fontFamily: sitePrimaryFont }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ĂÂĐÊÔƠƯàáảãạ !@#$%^&*()
              </p>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 flex flex-col">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="text-lg font-bold">
              {sheetTarget === "primary" ? "Chọn phông chữ chính" : "Chọn phông chữ phụ"}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4 flex flex-col gap-3">
            <div className="relative">
              <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phông chữ..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5">
              {[
                { id: "all", label: "Tất cả" },
                { id: "sans-serif", label: "Sans Serif" },
                { id: "serif", label: "Serif" },
                { id: "monospace", label: "Mono" },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    categoryFilter === cat.id
                      ? "bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-1 p-3">
              {filteredFonts.map(font => {
                loadFontPreview(font.family);
                const isSelected = sheetTarget === "primary"
                  ? sitePrimaryFont === font.family
                  : siteSecondaryFont === font.family;
                return (
                  <button
                    key={font.family}
                    type="button"
                    onClick={() => selectFont(font.family)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left w-full ${
                      isSelected
                        ? "bg-vanixjnk/10 border border-vanixjnk/25"
                        : "hover:bg-muted/80 border border-transparent"
                    }`}
                  >
                    <div className={`flex size-10 items-center justify-center rounded-lg border shrink-0 ${
                      isSelected ? "bg-vanixjnk/10 border-vanixjnk/20" : "bg-muted/50 border-border"
                    }`}>
                      <span className="text-base font-bold" style={{ fontFamily: font.family }}>Aa</span>
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">{font.family}</span>
                        {isSelected && <Icon icon="solar:check-circle-bold" className="size-4 text-vanixjnk shrink-0" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{font.category} • {font.weights.length} weights</span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5" style={{ fontFamily: font.family }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                      </span>
                    </div>
                  </button>
                );
              })}
              {isSearching && (
                <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                  <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin" />
                  <span className="text-xs font-medium">Đang tìm trên Google Fonts...</span>
                </div>
              )}
              {filteredFonts.length === 0 && !isSearching && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Icon icon="solar:magnifer-zoom-in-line-duotone" className="size-8 mb-2 opacity-50" />
                  <span className="text-sm font-medium">Không tìm thấy phông chữ</span>
                  <span className="text-[11px] mt-1">Thử nhập tên font khác để tìm trên Google Fonts</span>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <GalleryDialog open={galleryDialogOpen} onOpenChange={setGalleryDialogOpen} onSelect={handleSelectImage} />
    </div>
  );
}
