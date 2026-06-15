"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { Product } from "@/server/db/schemas/product.schema";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getProductTypeMeta = (type: string) => {
  switch (type) {
    case "source_code":
      return {
        label: "Mã nguồn",
        icon: "solar:code-line-duotone",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border border-emerald-500/25",
        solidBg: "bg-emerald-500",
      };
    case "tool":
      return {
        label: "Công cụ",
        icon: "solar:tuning-line-duotone",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border border-blue-500/25",
        solidBg: "bg-blue-500",
      };
    case "app":
      return {
        label: "Ứng dụng",
        icon: "solar:smartphone-line-duotone",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border border-purple-500/25",
        solidBg: "bg-purple-500",
      };
    case "bot":
      return {
        label: "Bot tự động",
        icon: "solar:ghost-line-duotone",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border border-amber-500/25",
        solidBg: "bg-amber-500",
      };
    case "extension":
      return {
        label: "Tiện ích",
        icon: "solar:plug-line-duotone",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        border: "border border-pink-500/25",
        solidBg: "bg-pink-500",
      };
    default:
      return {
        label: "Sản phẩm",
        icon: "solar:box-line-duotone",
        color: "text-zinc-500",
        bg: "bg-zinc-500/10",
        border: "border border-zinc-500/25",
        solidBg: "bg-zinc-500",
      };
  }
};

const getSolidColorForType = (type: string) => {
  switch (type) {
    case "source_code": return "#10b981";
    case "tool": return "#3b82f6";
    case "app": return "#a855f7";
    case "bot": return "#f59e0b";
    case "extension": return "#ec4899";
    default: return "#71717a";
  }
};

const formatPrice = (price: number, currency: string) => {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat(currency === "VND" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PubProductsList({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("order");

  const productTypesList = [
    { id: "all", name: "Tất cả danh mục", icon: "solar:widget-line-duotone" },
    { id: "source_code", name: "Mã nguồn", icon: "solar:code-line-duotone" },
    { id: "tool", name: "Công cụ", icon: "solar:tuning-line-duotone" },
    { id: "app", name: "Ứng dụng", icon: "solar:smartphone-line-duotone" },
    { id: "bot", name: "Bot tự động", icon: "solar:ghost-line-duotone" },
    { id: "extension", name: "Tiện ích mở rộng", icon: "solar:plug-line-duotone" },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let result = initialProducts.filter((product) => {
      const matchesType = typeFilter === "all" || product.type === typeFilter;

      const matchesPrice = (() => {
        if (priceFilter === "all") return true;
        const currentPrice = product.salePrice !== null ? product.salePrice : product.price;
        if (priceFilter === "free") return currentPrice === 0;
        if (priceFilter === "paid") return currentPrice > 0;
        return true;
      })();

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.compatibility.some((comp) => comp.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesPrice && matchesSearch;
    });

    // Sort mapping
    return result.sort((a, b) => {
      if (sortBy === "price_asc") {
        const pA = a.salePrice !== null ? a.salePrice : a.price;
        const pB = b.salePrice !== null ? b.salePrice : b.price;
        return pA - pB;
      }
      if (sortBy === "price_desc") {
        const pA = a.salePrice !== null ? a.salePrice : a.price;
        const pB = b.salePrice !== null ? b.salePrice : b.price;
        return pB - pA;
      }
      if (sortBy === "newest") {
        return Date.parse(String(b.createdAt)) - Date.parse(String(a.createdAt));
      }
      if (sortBy === "popular") {
        return (b.salesCount + b.downloadCount) - (a.salesCount + a.downloadCount);
      }
      // order / default
      return a.order - b.order;
    });
  }, [initialProducts, typeFilter, priceFilter, searchQuery, sortBy]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:box-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Kho Sản Phẩm Phần Mềm</h1>
              <p className="text-sm text-muted-foreground">
                Khám phá các sản phẩm chất lượng cao, mã nguồn SaaS, chatbot AI và công cụ tự động hóa được Vani Studio xây dựng và tối ưu.
              </p>
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
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full border-b border-border/40 pb-5">
            <div className="flex items-center gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, công nghệ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-10 text-[13px] bg-background/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 z-10"
                    title="Xóa tìm kiếm"
                  >
                    <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                  </button>
                )}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-9 w-9 border-border bg-background hover:bg-muted/50 shrink-0",
                      (typeFilter !== "all" || priceFilter !== "all") && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                    )}
                    title="Lọc sản phẩm"
                  >
                    <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 flex flex-col gap-3.5" align="end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                      Danh mục sản phẩm
                    </label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full h-9 justify-between bg-background border-border text-[13px]">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {productTypesList.map((type) => (
                          <SelectItem key={type.id} value={type.id} className="text-[13px]">
                            <span className="flex items-center gap-2">
                              <Icon icon={type.icon} className="size-3.5 shrink-0" />
                              <span>{type.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                      Mức giá
                    </label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="w-full h-9 justify-between bg-background border-border text-[13px]">
                        <SelectValue placeholder="Chọn mức giá" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        <SelectItem value="all" className="text-[13px]">Tất cả sản phẩm</SelectItem>
                        <SelectItem value="free" className="text-[13px]">Miễn phí</SelectItem>
                        <SelectItem value="paid" className="text-[13px]">Có phí (Premium)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs text-muted-foreground hidden md:inline">Sắp xếp:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48 h-9 bg-background border-border text-[13px]">
                  <SelectValue placeholder="Chọn sắp xếp" />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value="order" className="text-[13px]">Mặc định</SelectItem>
                  <SelectItem value="price_asc" className="text-[13px]">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price_desc" className="text-[13px]">Giá: Cao đến Thấp</SelectItem>
                  <SelectItem value="newest" className="text-[13px]">Mới nhất</SelectItem>
                  <SelectItem value="popular" className="text-[13px]">Bán chạy & Lượt tải</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAndSortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <div className="size-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
                <Icon icon="solar:box-minimalistic-line-duotone" className="text-3xl text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Không tìm thấy sản phẩm nào</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                Vui lòng thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để tìm sản phẩm mong muốn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedProducts.map((product) => {
                const meta = getProductTypeMeta(product.type);
                const solidColor = getSolidColorForType(product.type);
                const isFree = product.price === 0;
                const hasSale = product.salePrice !== null && product.salePrice !== undefined && product.salePrice < product.price;
                const finalPrice = hasSale ? product.salePrice! : product.price;

                return (
                  <Card key={product.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0 hover:border-vanixjnk/40 transition-all duration-300">
                    
                    {/* Premium Type Ribbon */}
                    <div className="absolute top-[-6px] right-3 z-20 w-8 h-12 pointer-events-none">
                      <div 
                        className={cn("absolute top-[6px] left-[-4px] w-1 h-[6px]", meta.solidBg)}
                        style={{
                          backgroundColor: solidColor,
                          clipPath: "polygon(100% 0, 100% 100%, 0% 100%)",
                          filter: "brightness(0.55)"
                        }}
                      />
                      <div 
                        className={cn("absolute top-[6px] right-[-4px] w-1 h-[6px]", meta.solidBg)}
                        style={{
                          backgroundColor: solidColor,
                          clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                          filter: "brightness(0.55)"
                        }}
                      />
                      <div 
                        className={cn("relative w-8 h-11 shadow-md flex flex-col justify-between rounded-t-sm", meta.solidBg)}
                        style={{
                          backgroundColor: solidColor,
                          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 82%, 0% 100%)",
                          backgroundImage: "linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(0, 0, 0, 0.2))",
                          backgroundBlendMode: "overlay"
                        }}
                      >
                        <div className="w-full h-[6px] bg-black/15 border-b border-black/10" />
                        <div className="flex-1 flex items-center justify-center -mt-1.5">
                          <Icon icon={meta.icon} className="size-5 text-white drop-shadow" />
                        </div>
                      </div>
                    </div>

                    <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/50 flex items-center justify-center select-none">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-linear-to-br from-vanixjnk/5 to-vanixjnk/15 flex items-center justify-center">
                          <Icon icon={meta.icon} className={`text-5xl ${meta.color} opacity-40`} />
                        </div>
                      )}

                      {/* Visual Badge */}
                      {product.badge && (
                        <span className={cn(
                          "absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-extrabold tracking-wider uppercase shadow-md border z-10 select-none",
                          product.badge === "HOT" && "text-rose-500 bg-rose-500/10 border border-rose-500/25",
                          product.badge === "SALE" && "text-amber-500 bg-amber-500/10 border border-amber-500/25",
                          product.badge === "NEW" && "text-emerald-500 bg-emerald-500/10 border border-emerald-500/25",
                          product.badge === "BETA" && "text-blue-500 bg-blue-500/10 border border-blue-500/25"
                        )}>
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-5 gap-3">
                      <div className="space-y-1">
                        <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:z-10">
                          <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-vanixjnk transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                        </p>
                      </div>

                      {/* Specs Row */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded bg-muted/30 border border-border/50 font-mono">
                          v{product.version}
                        </span>
                        {product.fileSize && (
                          <span className="px-1.5 py-0.5 rounded bg-muted/30 border border-border/50">
                            {product.fileSize}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-muted/30 border border-border/50">
                          {product.licenseType === "single" ? "Single License" : product.licenseType === "free" ? "Free" : "Extended"}
                        </span>
                      </div>

                      {/* Features Preview */}
                      {product.features && product.features.length > 0 && (
                        <div className="space-y-1.5 border-t border-border/50 pt-3 my-0.5 flex-1">
                          {product.features.slice(0, 2).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Icon icon="solar:verified-check-line-duotone" className="text-emerald-500 text-sm shrink-0 mt-0.5" />
                              <span className="line-clamp-1 font-medium">{feat.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing Footer */}
                    <div className="border-t border-border px-5 py-4 flex items-center justify-between bg-muted/10 rounded-b-xl group-hover:bg-muted/15 transition-all duration-300">
                      <div>
                        {isFree ? (
                          <div className="text-sm font-extrabold text-emerald-500 uppercase tracking-wide">Miễn phí</div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-extrabold text-foreground">
                                {formatPrice(finalPrice, product.currency)}
                              </span>
                              {hasSale && (
                                <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {isFree ? "/ tải miễn phí" : "/ bản quyền lifetime"}
                        </span>
                      </div>

                      <div className="relative flex items-center justify-end h-8 w-24 overflow-hidden select-none">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:-translate-y-8 group-hover:opacity-0 transition-all duration-300">
                          <Icon icon="solar:cloud-download-line-duotone" className="text-xs text-vanixjnk" />
                          <span>{product.downloadCount + product.salesCount} lượt tải</span>
                        </div>
                        <div className="absolute flex items-center gap-1 text-xs font-bold text-vanixjnk translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span>Xem chi tiết</span>
                          <Icon icon="solar:arrow-right-linear" className="text-xs" />
                        </div>
                      </div>
                    </div>
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
