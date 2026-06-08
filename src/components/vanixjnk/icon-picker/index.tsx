"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CURATED_CATEGORIES = [
  {
    name: "Arrows (Mũi tên & Điều hướng)",
    icons: [
      "solar:alt-arrow-down-line-duotone",
      "solar:alt-arrow-left-line-duotone",
      "solar:alt-arrow-right-line-duotone",
      "solar:alt-arrow-up-line-duotone",
      "solar:arrow-down-line-duotone",
      "solar:arrow-left-line-duotone",
      "solar:arrow-right-line-duotone",
      "solar:arrow-up-line-duotone",
      "solar:round-alt-arrow-down-line-duotone",
      "solar:round-alt-arrow-left-line-duotone",
      "solar:round-alt-arrow-right-line-duotone",
      "solar:round-alt-arrow-up-line-duotone",
      "solar:transfer-horizontal-line-duotone",
      "solar:transfer-vertical-line-duotone",
      "solar:refresh-line-duotone",
      "solar:restart-line-duotone",
    ],
  },
  {
    name: "Common & UI (Phổ biến & Thiết lập)",
    icons: [
      "solar:settings-line-duotone",
      "solar:settings-minimalistic-line-duotone",
      "solar:menu-dots-line-duotone",
      "solar:menu-dots-square-line-duotone",
      "solar:bell-line-duotone",
      "solar:bell-bing-line-duotone",
      "solar:calendar-line-duotone",
      "solar:calendar-date-line-duotone",
      "solar:clock-circle-line-duotone",
      "solar:info-circle-line-duotone",
      "solar:question-circle-line-duotone",
      "solar:check-circle-line-duotone",
      "solar:close-circle-line-duotone",
      "solar:danger-circle-line-duotone",
      "solar:add-circle-line-duotone",
      "solar:minus-circle-line-duotone",
      "solar:home-smile-line-duotone",
      "solar:home-line-duotone",
    ],
  },
  {
    name: "Users & Communication (Thành viên & Liên hệ)",
    icons: [
      "solar:user-line-duotone",
      "solar:user-circle-line-duotone",
      "solar:users-group-two-rounded-line-duotone",
      "solar:user-speak-rounded-line-duotone",
      "solar:user-rounded-line-duotone",
      "solar:phone-line-duotone",
      "solar:phone-calling-line-duotone",
      "solar:chat-round-line-duotone",
      "solar:chat-square-line-duotone",
      "solar:letter-line-duotone",
      "solar:letter-opened-line-duotone",
      "solar:mailbox-line-duotone",
    ],
  },
  {
    name: "Business & Shopping (Kinh doanh & Mua sắm)",
    icons: [
      "solar:bag-line-duotone",
      "solar:bag-3-line-duotone",
      "solar:cart-line-duotone",
      "solar:cart-large-2-line-duotone",
      "solar:shop-line-duotone",
      "solar:wallet-line-duotone",
      "solar:wallet-2-line-duotone",
      "solar:card-line-duotone",
      "solar:tag-line-duotone",
      "solar:tag-price-line-duotone",
      "solar:bill-line-duotone",
      "solar:bill-list-line-duotone",
    ],
  },
  {
    name: "Content & Files (Nội dung & Tài liệu)",
    icons: [
      "solar:document-line-duotone",
      "solar:document-text-line-duotone",
      "solar:folder-line-duotone",
      "solar:folder-with-files-line-duotone",
      "solar:copy-line-duotone",
      "solar:clipboard-list-line-duotone",
      "solar:trash-bin-trash-line-duotone",
      "solar:trash-bin-minimalistic-line-duotone",
      "solar:pen-line-duotone",
      "solar:pen-2-line-duotone",
      "solar:notebook-line-duotone",
      "solar:bookmark-line-duotone",
    ],
  },
  {
    name: "Media & Sound (Hình ảnh & Âm thanh)",
    icons: [
      "solar:play-line-duotone",
      "solar:pause-line-duotone",
      "solar:stop-line-duotone",
      "solar:music-note-line-duotone",
      "solar:gallery-line-duotone",
      "solar:videocamera-line-duotone",
      "solar:videocamera-record-line-duotone",
      "solar:volume-loud-line-duotone",
      "solar:camera-line-duotone",
      "solar:headphones-round-sound-line-duotone",
    ],
  },
  {
    name: "Security & Tech (Bảo mật & Công nghệ)",
    icons: [
      "solar:lock-line-duotone",
      "solar:lock-keyhole-line-duotone",
      "solar:key-line-duotone",
      "solar:key-square-line-duotone",
      "solar:shield-line-duotone",
      "solar:shield-warning-line-duotone",
      "solar:eye-line-duotone",
      "solar:eye-closed-line-duotone",
      "solar:cpu-line-duotone",
      "solar:database-line-duotone",
      "solar:server-line-duotone",
      "solar:link-round-angle-line-duotone",
    ],
  },
  {
    name: "Devices & Tools (Thiết bị & Công cụ)",
    icons: [
      "solar:laptop-line-duotone",
      "solar:monitor-line-duotone",
      "solar:smartphone-line-duotone",
      "solar:ssd-round-line-duotone",
      "solar:battery-charge-line-duotone",
      "solar:palette-line-duotone",
      "solar:ruler-line-duotone",
      "solar:scissors-line-duotone",
      "solar:tuning-line-duotone",
    ],
  },
  {
    name: "Others (Khác & Tự nhiên)",
    icons: [
      "solar:rocket-line-duotone",
      "solar:earth-line-duotone",
      "solar:sun-line-duotone",
      "solar:moon-line-duotone",
      "solar:cloud-line-duotone",
      "solar:fire-line-duotone",
      "solar:leaf-line-duotone",
      "solar:map-line-duotone",
      "solar:compass-line-duotone",
      "solar:star-line-duotone",
      "solar:heart-line-duotone",
    ],
  },
];

const BRAND_CATEGORIES = [
  {
    name: "Simple Icons (Phổ biến)",
    icons: [
      "simple-icons:facebook",
      "simple-icons:zalo",
      "simple-icons:messenger",
      "simple-icons:telegram",
      "simple-icons:github",
      "simple-icons:google",
      "simple-icons:youtube",
      "simple-icons:tiktok",
      "simple-icons:instagram",
      "simple-icons:whatsapp",
      "simple-icons:discord",
      "simple-icons:apple",
      "simple-icons:android",
      "simple-icons:figma",
      "simple-icons:notion",
      "simple-icons:spotify",
      "simple-icons:pinterest",
      "simple-icons:reddit",
      "simple-icons:snapchat",
      "simple-icons:vimeo",
      "simple-icons:wordpress",
      "simple-icons:dribbble",
      "simple-icons:behance",
      "simple-icons:medium",
      "simple-icons:twitch",
      "simple-icons:zoom",
      "simple-icons:steam",
      "simple-icons:paypal",
      "simple-icons:stripe",
      "simple-icons:visa",
      "simple-icons:mastercard",
    ],
  },
  {
    name: "Arcticons (Nét mảnh)",
    icons: [
      "arcticons:facebook",
      "arcticons:zalo",
      "arcticons:facebook-messenger",
      "arcticons:telegram",
      "arcticons:github",
      "arcticons:google",
      "arcticons:youtube",
      "arcticons:tiktok",
      "arcticons:instagram",
      "arcticons:linkedin",
      "arcticons:whatsapp",
      "arcticons:discord",
      "arcticons:skype",
      "arcticons:twitter",
      "arcticons:applemusic",
      "arcticons:android",
      "arcticons:microsoft-teams",
      "arcticons:figma",
      "arcticons:notion",
      "arcticons:slack",
      "arcticons:spotify",
      "arcticons:pinterest",
      "arcticons:reddit",
      "arcticons:snapchat",
      "arcticons:vimeo",
      "arcticons:wordpress",
      "arcticons:behance",
      "arcticons:medium",
      "arcticons:twitch",
      "arcticons:zoom",
      "arcticons:steam",
      "arcticons:paypal",
      "arcticons:mastercard",
    ],
  },
  {
    name: "Brandico (Cổ điển)",
    icons: [
      "brandico:facebook",
      "brandico:facebook-rect",
      "brandico:twitter",
      "brandico:twitter-bird",
      "brandico:vimeo",
      "brandico:vimeo-rect",
      "brandico:tumblr",
      "brandico:tumblr-rect",
      "brandico:googleplus-rect",
      "brandico:github",
      "brandico:linkedin",
      "brandico:skype",
      "brandico:icq",
      "brandico:yandex",
      "brandico:odnoklassniki",
      "brandico:odnoklassniki-rect",
      "brandico:vkontakte-rect",
    ],
  },
  {
    name: "Biểu tượng Tùy chỉnh (Tech & Logos)",
    icons: [
      "logos:javascript",
      "logos:typescript-icon",
      "logos:react",
      "logos:nextjs-icon",
      "logos:vue",
      "logos:angular-icon",
      "logos:tailwindcss-icon",
      "logos:nodejs-icon",
      "logos:html-5",
      "logos:visual-studio-code",
      "logos:git-icon",
      "logos:docker-icon",
      "logos:kubernetes",
      "logos:aws",
      "logos:firebase",
      "logos:supabase-icon",
      "logos:mysql-icon",
      "logos:postgresql",
      "logos:mongodb-icon",
      "logos:redis",
      "logos:cloudflare-icon",
      "logos:vercel-icon",
    ],
  },
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  trigger?: React.ReactNode;
}

export function IconPicker({ value, onChange, trigger }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"solar" | "brands">("solar");

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(
            searchQuery.trim()
          )}&limit=48`
        );
        const data = await response.json();
        if (data && Array.isArray(data.icons)) {
          setSearchResults(data.icons);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Failed to search Iconify icons", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectIcon = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2 h-9 px-3 rounded-lg border bg-background hover:bg-muted transition-colors cursor-pointer select-none"
          >
            <Icon icon={value || "solar:link-round-angle-line-duotone"} className="text-lg text-muted-foreground" />
            <span className="text-xs font-semibold">{value || "Chọn icon..."}</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col h-full bg-background border-l border-border p-6 gap-4">
        <SheetHeader className="p-0 text-left flex flex-col items-start justify-start gap-1">
          <SheetTitle className="text-lg font-bold text-foreground">Chọn biểu tượng</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Chọn biểu tượng có sẵn bên dưới hoặc tìm kiếm từ thư viện Iconify.
          </p>
        </SheetHeader>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex gap-1 bg-muted p-0.5 rounded-lg shrink-0 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("solar")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer select-none",
                activeTab === "solar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Biểu tượng Solar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("brands")}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer select-none",
                activeTab === "brands"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Thương hiệu & Mạng xã hội
            </button>
          </div>
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm biểu tượng (ví dụ: home, user, facebook, github...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 h-9 text-xs w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                <Icon icon="solar:close-circle-bold" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {searchQuery.trim() ? (
            <div className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold tracking-widest text-muted-foreground/80 uppercase font-mono">
                Kết quả tìm kiếm cho "{searchQuery}"
              </h4>
              {searching ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                  <Icon icon="solar:spinner-line-duotone" className="text-2xl animate-spin text-vanixjnk" />
                  <span className="text-xs font-semibold">Đang tìm kiếm trên Iconify...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                  <Icon icon="solar:info-circle-line-duotone" className="text-3xl text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-semibold">Không tìm thấy biểu tượng nào phù hợp</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    Thử tìm bằng tiếng Anh (ví dụ: home, link, settings, shield...)
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,40px)] gap-2 p-0.5">
                  {searchResults.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelectIcon(iconName)}
                      title={iconName}
                      className={cn(
                        "group size-10 rounded-lg border flex items-center justify-center bg-background hover:bg-vanixjnk/10 hover:border-vanixjnk/30 active:scale-95 transition-all duration-150 cursor-pointer",
                        value === iconName ? "border-vanixjnk bg-vanixjnk/5 text-vanixjnk" : "border-border text-foreground"
                      )}
                    >
                      <Icon icon={iconName} className="text-xl group-hover:scale-110 transition-transform" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "solar" ? (
            <div className="flex flex-col gap-6">
              {CURATED_CATEGORIES.map((category) => (
                <div key={category.name} className="flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold tracking-widest text-muted-foreground/80 uppercase font-mono">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-[repeat(auto-fill,40px)] gap-2 p-0.5">
                    {category.icons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleSelectIcon(iconName)}
                        title={iconName}
                        className={cn(
                          "group size-10 rounded-lg border flex items-center justify-center bg-background hover:bg-vanixjnk/10 hover:border-vanixjnk/30 active:scale-95 transition-all duration-150 cursor-pointer",
                          value === iconName ? "border-vanixjnk bg-vanixjnk/5 text-vanixjnk" : "border-border text-foreground"
                        )}
                      >
                        <Icon icon={iconName} className="text-xl group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {BRAND_CATEGORIES.map((category) => (
                <div key={category.name} className="flex flex-col gap-3">
                  <h4 className="text-[11px] font-bold tracking-widest text-muted-foreground/80 uppercase font-mono">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-[repeat(auto-fill,40px)] gap-2 p-0.5">
                    {category.icons.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleSelectIcon(iconName)}
                        title={iconName}
                        className={cn(
                          "group size-10 rounded-lg border flex items-center justify-center bg-background hover:bg-vanixjnk/10 hover:border-vanixjnk/30 active:scale-95 transition-all duration-150 cursor-pointer",
                          value === iconName ? "border-vanixjnk bg-vanixjnk/5 text-vanixjnk" : "border-border text-foreground"
                        )}
                      >
                        <Icon icon={iconName} className="text-xl group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
