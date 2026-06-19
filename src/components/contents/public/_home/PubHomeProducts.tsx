"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/server/db/schemas/product.schema";

interface PubHomeProductsProps {
  initialProducts: Product[];
}

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
        icon: "solar:cpu-line-duotone",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border border-amber-500/25",
        solidBg: "bg-amber-500",
      };
    case "extension":
      return {
        label: "Tiện ích",
        icon: "solar:widget-2-line-duotone",
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

const formatProductPrice = (price: number, currency: string) => {
  if (price === 0) return "Miễn phí";
  return new Intl.NumberFormat(currency === "VND" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PubHomeProducts({ initialProducts }: PubHomeProductsProps) {
  if (initialProducts.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
        <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-2.5">
          <Icon icon="solar:case-line-duotone" className="text-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vanixjnk">Our Products</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Sản phẩm mã nguồn & Tiện ích
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialProducts.map((product) => {
          const meta = getProductTypeMeta(product.type);
          const solidColor = getSolidColorForType(product.type);
          return (
            <Card key={product.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0!">
              <div className="absolute top-[-6px] right-3 z-20 w-8 h-12 pointer-events-none">
                <div
                  className="absolute top-[6px] left-[-4px] w-1 h-[6px]"
                  style={{
                    backgroundColor: solidColor,
                    clipPath: "polygon(100% 0, 100% 100%, 0% 100%)",
                    filter: "brightness(0.55)",
                  }}
                />
                <div
                  className="absolute top-[6px] right-[-4px] w-1 h-[6px]"
                  style={{
                    backgroundColor: solidColor,
                    clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                    filter: "brightness(0.55)",
                  }}
                />
                <div
                  className="relative w-8 h-11 shadow-[0_4px_8px_rgba(0,0,0,0.35)] flex flex-col justify-between rounded-t-[1px]"
                  style={{
                    backgroundColor: solidColor,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 82%, 0% 100%)",
                    backgroundImage: "linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(0, 0, 0, 0.2))",
                    backgroundBlendMode: "overlay",
                  }}
                >
                  <div className="w-full h-[6px] bg-black/15 border-b border-black/10" />
                  <div className="flex-1 flex items-center justify-center -mt-1.5">
                    <Icon icon={meta.icon} className="size-5 text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]" />
                  </div>
                </div>
              </div>

              <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
                <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/55 flex items-center justify-center">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-vanixjnk/5 to-vanixjnk/15 flex items-center justify-center">
                      <Icon icon={meta.icon} className={`text-5xl ${meta.color} opacity-40`} />
                    </div>
                  )}

                  {product.badge && (
                    <span className={cn(
                      "absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase shadow-md border z-10 select-none",
                      product.badge === "HOT" && "text-rose-500 bg-rose-500/10 border border-rose-500/25",
                      product.badge === "SALE" && "text-amber-500 bg-amber-500/10 border border-amber-500/25",
                      product.badge === "NEW" && "text-emerald-500 bg-emerald-500/10 border border-emerald-500/25",
                      product.badge === "BETA" && "text-blue-500 bg-blue-500/10 border border-blue-500/25"
                    )}>
                      {product.badge}
                    </span>
                  )}

                  <div className={cn(
                    "absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase shadow-md border z-10 select-none bg-background/80 backdrop-blur-md",
                    meta.color,
                    meta.bg,
                    meta.border
                  )}>
                    {meta.label}
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description || "Chưa có mô tả ngắn gọn cho sản phẩm này."}
                    </p>
                  </div>

                  <div className="flex-1 mt-2">
                    <ul className="space-y-1.5">
                      {product.features && product.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Icon icon="solar:verified-check-line-duotone" className="text-emerald-500 text-sm shrink-0 mt-0.5" />
                          <span className="truncate">{feat.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-1 select-none font-medium border-t border-border/30">
                    <span>Phiên bản: {product.version || "1.0.0"}</span>
                    {product.fileSize && <span>Dung lượng: {product.fileSize}</span>}
                  </div>
                </div>

                <div className="border-t border-border px-5 py-4 flex items-center justify-between bg-muted/10 rounded-b-xl group-hover:bg-muted/15 transition-colors">
                  <div>
                    <div className="text-[10px] text-muted-foreground">
                      {product.price === 0 ? "Bản quyền" : "Giá sản phẩm"}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {formatProductPrice(product.price, product.currency)}
                    </span>
                  </div>

                  <div className="relative flex items-center justify-end h-8 min-w-[85px] overflow-hidden">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:-translate-y-8 group-hover:opacity-0 transition-all duration-300">
                      <Icon icon="solar:download-minimalistic-line-duotone" className="text-xs" />
                      {product.downloadCount ?? 0} lượt tải
                    </div>
                    <div className="absolute flex items-center gap-1 text-[13px] font-bold text-vanixjnk translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span>{product.price === 0 ? "Tải ngay" : "Mua ngay"}</span>
                      <Icon icon="solar:arrow-right-linear" className="text-xs" />
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="vanixjnk" asChild>
          <Link href="/products">
            <Icon icon="solar:case-line-duotone" className="text-base shrink-0" />
            <span>Xem tất cả sản phẩm</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
