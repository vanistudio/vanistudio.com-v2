"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  order: number;
  createdAt: Date;
}

interface PubDocsProductListProps {
  initialProducts: ApiProduct[];
}

export default function PubDocsProductList({
  initialProducts,
}: PubDocsProductListProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (product.description &&
          product.description.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        product.slug.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesSearch;
    });
  }, [initialProducts, debouncedSearch]);

  if (!mounted) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-xl bg-muted/40 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-muted/40 animate-pulse rounded" />
                <div className="h-4 w-96 bg-muted/40 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1">
      {/* 1. Header Banner */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:document-text-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Tài Liệu Tích Hợp API
              </h1>
              <p className="text-sm text-muted-foreground">
                Khám phá hệ thống tài liệu kỹ thuật, đặc tả tham số và thử nghiệm chạy các sản phẩm API của Vani Studio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Diagonal Stripe Divider */}
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

      {/* 3. Products List Area */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="flex items-center gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm tài liệu API..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 z-10"
                    title="Xóa nhập liệu"
                  >
                    <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="size-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
                <Icon icon="solar:document-text-line-duotone" className="text-3xl text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Không tìm thấy tài liệu API nào</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                Thử nhập từ khóa khác để tìm đúng tích hợp API sản phẩm bạn cần.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                return (
                  <Card key={product.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0!">
                    {/* Corner Ribbon / Bookmark */}
                    <div className="absolute top-[-6px] right-3 z-20 w-8 h-12 pointer-events-none">
                      <div
                        className="absolute top-[6px] left-[-4px] w-1 h-[6px]"
                        style={{
                          backgroundColor: "var(--vanixjnk)",
                          clipPath: "polygon(100% 0, 100% 100%, 0% 100%)",
                          filter: "brightness(0.55)",
                        }}
                      />
                      <div
                        className="absolute top-[6px] right-[-4px] w-1 h-[6px]"
                        style={{
                          backgroundColor: "var(--vanixjnk)",
                          clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                          filter: "brightness(0.55)",
                        }}
                      />
                      <div
                        className="relative w-8 h-11 shadow-[0_4px_8px_rgba(0,0,0,0.35)] flex flex-col justify-between rounded-t-[1px]"
                        style={{
                          backgroundColor: "var(--vanixjnk)",
                          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 82%, 0% 100%)",
                          backgroundImage: "linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(0, 0, 0, 0.2))",
                          backgroundBlendMode: "overlay",
                        }}
                      >
                        <div className="w-full h-[6px] bg-black/15 border-b border-black/10" />
                        <div className="flex-1 flex items-center justify-center -mt-1.5">
                          <Icon icon="solar:programming-line-duotone" className="size-4 text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]" />
                        </div>
                      </div>
                    </div>

                    <Link href={`/docs/${product.slug}`} className="flex flex-col h-full">
                      {/* Product Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/55 flex items-center justify-center select-none">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-vanixjnk/5 to-vanixjnk/15 flex items-center justify-center">
                            <Icon icon="solar:document-text-line-duotone" className="text-5xl text-vanixjnk opacity-40" />
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-md border z-10 bg-background/80 text-foreground border-border/50 backdrop-blur-md">
                            API Docs
                          </span>
                        </div>
                      </div>

                      {/* Product Title & Description */}
                      <div className="flex flex-col flex-1 p-5 gap-3">
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-foreground line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {product.description || "Tài liệu kỹ thuật tích hợp hệ thống, đặc tả tham số và thử nghiệm chạy API trực tiếp."}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer with Slide animation */}
                      <div className="border-t border-border px-5 py-4 flex items-center justify-between bg-muted/10 rounded-b-xl group-hover:bg-muted/15 transition-colors">
                        <div>
                          <div className="text-sm font-bold text-foreground flex items-center gap-1">
                            <Icon icon="solar:hashtag-line-duotone" className="size-3.5 text-muted-foreground" />
                            <span className="font-mono text-xs">{product.slug}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            Định danh API
                          </span>
                        </div>

                        <div className="relative flex items-center justify-end h-8 min-w-[95px] overflow-hidden">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:-translate-y-8 group-hover:opacity-0 transition-all duration-300">
                            <Icon icon="solar:shield-check-line-duotone" className="text-xs" />
                            Đặc tả chuẩn
                          </div>
                          <div className="absolute flex items-center gap-1 text-[13px] font-bold text-vanixjnk translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <span>Xem tài liệu</span>
                            <Icon icon="solar:arrow-right-linear" className="text-xs" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
