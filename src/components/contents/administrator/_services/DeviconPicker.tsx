"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEVICON_ICONS } from "./devicon-list";
import { cn } from "@/lib/utils";

interface DeviconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string) => void;
  selectedIcons: string[];
}

export function DeviconPicker({
  open,
  onOpenChange,
  onSelect,
  selectedIcons,
}: DeviconPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(100);

  const filteredIcons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return DEVICON_ICONS;
    return DEVICON_ICONS.filter((icon) =>
      icon.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onOpenChange(false);
    setSearchQuery("");
    setVisibleCount(100);
  };

  const hasMore = filteredIcons.length > visibleCount;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) {
        setSearchQuery("");
        setVisibleCount(100);
      }
    }}>
      <DialogContent className="sm:max-w-[550px] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center">
              <Icon icon="solar:cpu-line-duotone" className="size-5" />
            </div>
            Chọn công nghệ / công cụ
          </DialogTitle>
          <DialogDescription className="text-left mt-1 text-[13px]">
            Tìm kiếm và chọn biểu tượng công nghệ tương ứng cho dịch vụ.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4 px-1">
          <div className="relative">
            <Input
              placeholder="Tìm kiếm công nghệ (ví dụ: react, node, python, figma...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(100);
              }}
              className="pr-8 h-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setVisibleCount(100);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                <Icon icon="solar:close-circle-bold" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto min-h-[200px] max-h-[45vh] custom-scrollbar pr-1 flex flex-col gap-2">
            {displayedIcons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Icon icon="solar:info-circle-line-duotone" className="size-10 opacity-30 mb-2" />
                <span className="text-[13px]">Không tìm thấy công nghệ nào phù hợp.</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2">
                  {displayedIcons.map((iconName) => {
                    const isSelected = selectedIcons.includes(iconName);
                    const cleanName = iconName
                      .replace("devicon:", "")
                      .replace("-wordmark", "");

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleSelect(iconName)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer hover:bg-vanixjnk/5 hover:border-vanixjnk/30 active:scale-95 group",
                          isSelected
                            ? "border-vanixjnk bg-vanixjnk/5 text-vanixjnk"
                            : "border-border/60 bg-background/50 text-foreground"
                        )}
                      >
                        <Icon
                          icon={iconName}
                          className={cn(
                            "text-2xl mb-1.5 transition-transform duration-200",
                            isSelected ? "scale-100" : "opacity-80"
                          )}
                        />
                        <span className="text-[10px] font-medium truncate w-full px-1">
                          {cleanName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold"
                      onClick={() => setVisibleCount((prev) => prev + 100)}
                    >
                      Xem thêm
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full mt-2">
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Hủy bỏ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
