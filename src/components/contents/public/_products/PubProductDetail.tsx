"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { Product, ChangelogItem } from "@/server/db/schemas/product.schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";

interface PubProductDetailProps {
  product: Product;
}

const getProductTypeMeta = (type: string) => {
  switch (type) {
    case "source_code":
      return {
        label: "Mã nguồn",
        icon: "solar:code-line-duotone",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/25",
      };
    case "tool":
      return {
        label: "Công cụ",
        icon: "solar:tuning-line-duotone",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/25",
      };
    case "app":
      return {
        label: "Ứng dụng",
        icon: "solar:smartphone-line-duotone",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        border: "border-purple-500/25",
      };
    case "bot":
      return {
        label: "Bot tự động",
        icon: "solar:cpu-line-duotone",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/25",
      };
    case "extension":
      return {
        label: "Tiện ích",
        icon: "solar:widget-2-line-duotone",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
        border: "border-pink-500/25",
      };
    default:
      return {
        label: "Sản phẩm",
        icon: "solar:box-line-duotone",
        color: "text-zinc-500",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/25",
      };
  }
};

const getLicenseLabel = (license: string) => {
  switch (license) {
    case "single": return "Single License";
    case "extended": return "Extended License";
    case "subscription": return "Subscription";
    case "free": return "Free / Open Source";
    default: return license;
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

export default function PubProductDetail({ product }: PubProductDetailProps) {
  const typeMeta = getProductTypeMeta(product.type);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaGalleryList: string[] = React.useMemo(() => {
    const list: string[] = [];
    if (product.thumbnail) {
      list.push(product.thumbnail);
    }
    if (product.gallery && product.gallery.length > 0) {
      list.push(...product.gallery);
    }
    return Array.from(new Set(list));
  }, [product.thumbnail, product.gallery]);

  const isFree = product.price === 0;
  const hasSale = product.salePrice !== null && product.salePrice !== undefined && product.salePrice < product.price;
  const finalPrice = hasSale ? product.salePrice! : product.price;

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon={typeMeta.icon} className="text-3xl" />
            </div>

            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground select-none">
                <Link href="/" className="hover:text-vanixjnk transition-colors flex items-center gap-1">
                  <Icon icon="solar:home-2-line-duotone" className="size-4" />
                  Trang chủ
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <Link href="/products" className="hover:text-vanixjnk transition-colors">
                  Sản phẩm
                </Link>
                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                <span className="text-foreground font-semibold truncate max-w-[200px]">{product.name}</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">{product.name}</h1>

              {product.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 mt-1.5 select-none">
                <Badge className={cn("px-2.5 py-0.5 text-xs font-bold border", typeMeta.bg, typeMeta.color, typeMeta.border)}>
                  <Icon icon={typeMeta.icon} className="mr-1 size-3 shrink-0" />
                  {typeMeta.label}
                </Badge>
                <Badge className="px-2.5 py-0.5 text-xs font-bold border border-vanixjnk/25 bg-vanixjnk/10 text-vanixjnk">
                  v{product.version}
                </Badge>
                {product.badge && (
                  <Badge className="px-2.5 py-0.5 text-xs font-bold border border-rose-500/25 bg-rose-500/10 text-rose-500">
                    {product.badge}
                  </Badge>
                )}
              </div>
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

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            <div className="lg:col-span-8 flex flex-col gap-6 order-2 lg:order-1">
              {mediaGalleryList.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="aspect-video w-full rounded-xl border border-border bg-background overflow-hidden relative group">
                    <img
                      src={mediaGalleryList[activeMediaIndex]}
                      alt={product.name}
                      className="size-full object-cover transition-all duration-500"
                    />
                  </div>
                  
                  {mediaGalleryList.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {mediaGalleryList.map((url, idx) => {
                        const isActive = activeMediaIndex === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveMediaIndex(idx)}
                            className={cn(
                              "group aspect-video rounded-xl overflow-hidden border transition-all duration-300 cursor-pointer relative bg-muted/20 shadow-xs",
                              isActive
                                ? "border-vanixjnk opacity-100"
                                : "border-border hover:border-muted-foreground/40 opacity-60 hover:opacity-100"
                            )}
                          >
                            <img
                              src={url}
                              alt="product screenshot"
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              )}
              <Card className="p-5 bg-card/30 border-border">
                <div className="flex items-center gap-2 pb-3 border-b border-border/50 mb-4">
                  <Icon icon="solar:document-text-line-duotone" className="text-base text-vanixjnk" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thông tin tài liệu & giới thiệu</h3>
                </div>
                <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base leading-relaxed">
                  <MdxRenderer content={product.content} scope={{ product }} />
                </div>
              </Card>
              {product.features && product.features.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                    <Icon icon="solar:stars-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Tính năng nổi bật</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex gap-3 items-start p-3.5 rounded-lg bg-muted/15 border border-border/50">
                        <div className="p-1 rounded-md text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 shrink-0 mt-0.5">
                          <Icon icon={feat.icon || "solar:verified-check-line-duotone"} className="size-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-foreground">{feat.name}</h4>
                          {feat.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {feat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              {product.changelog && product.changelog.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                    <Icon icon="solar:history-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Lịch sử cập nhật (Changelog)</h3>
                  </div>
                  <div className="relative pl-6 border-l border-border/70 space-y-6 ml-2 my-2 select-none">
                    {product.changelog.map((log: ChangelogItem, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[31px] top-1.5 size-4 rounded-full bg-background border-2 border-vanixjnk flex items-center justify-center">
                          <span className="size-1.5 rounded-full bg-vanixjnk" />
                        </span>
                        
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/25">
                              Version {log.version}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon icon="solar:calendar-line-duotone" className="size-3.5" />
                              {log.date}
                            </span>
                          </div>

                          {log.title && (
                            <h4 className="text-xs font-bold text-foreground">{log.title}</h4>
                          )}

                          <ul className="space-y-1.5 pl-4 list-disc text-xs text-muted-foreground">
                            {log.changes.map((change, cIdx) => (
                              <li key={cIdx} className="leading-relaxed">
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6 order-1 lg:order-2">
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                <div className="flex flex-col gap-1 border-b border-border/40 pb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đơn giá sản phẩm</span>
                  {isFree ? (
                    <div className="text-2xl font-black text-emerald-500 tracking-wide mt-1">Miễn phí</div>
                  ) : (
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-foreground">
                        {formatPrice(finalPrice, product.currency)}
                      </span>
                      {hasSale && (
                        <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/60">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {isFree ? "Mã nguồn mở miễn phí bản quyền" : "Giấy phép vĩnh viễn (One-time payment)"}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {isFree ? (
                    product.downloadUrl ? (
                      <Button
                        variant="vanixjnk"
                        size="sm"
                        asChild
                        className="w-full font-bold text-xs py-5 gap-2 justify-center shadow-md"
                      >
                        <a href={product.downloadUrl} download>
                          <Icon icon="solar:cloud-download-line-duotone" className="size-4 shrink-0" />
                          <span>Tải xuống miễn phí</span>
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="vanixjnk"
                        size="sm"
                        asChild
                        className="w-full font-bold text-xs py-5 gap-2 justify-center shadow-md"
                      >
                        <Link href={`/contact?subject=T%E1%BA%A3i%20s%E1%BA%A3n%20ph%E1%BA%A9m%20${encodeURIComponent(product.name)}&product=${encodeURIComponent(product.slug)}`}>
                          <Icon icon="solar:bill-list-line-duotone" className="size-4 shrink-0" />
                          <span>Liên hệ tải sản phẩm</span>
                        </Link>
                      </Button>
                    )
                  ) : (
                    product.downloadUrl ? (
                      <Button
                        variant="vanixjnk"
                        size="sm"
                        asChild
                        className="w-full font-bold text-xs py-5 gap-2 justify-center shadow-md"
                      >
                        <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Icon icon="solar:cart-large-line-duotone" className="size-4 shrink-0" />
                          <span>Mua ngay</span>
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="vanixjnk"
                        size="sm"
                        asChild
                        className="w-full font-bold text-xs py-5 gap-2 justify-center shadow-md"
                      >
                        <Link href={`/contact?subject=Mua%20s%E1%BA%A3n%20ph%E1%BA%A9m%20${encodeURIComponent(product.name)}&product=${encodeURIComponent(product.slug)}`}>
                          <Icon icon="solar:bill-list-line-duotone" className="size-4 shrink-0" />
                          <span>Liên hệ mua sản phẩm</span>
                        </Link>
                      </Button>
                    )
                  )}

                  {product.demoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full font-bold text-xs py-5 gap-2 justify-center bg-background/50"
                    >
                      <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Icon icon="solar:globus-line-duotone" className="size-4 shrink-0" />
                        <span>Xem bản Demo trực tuyến</span>
                      </a>
                    </Button>
                  )}

                  {product.githubUrl && product.price === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full font-bold text-xs py-5 gap-2 justify-center bg-background/50"
                    >
                      <a href={product.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Icon icon="simple-icons:github" className="size-4 shrink-0" />
                        <span>Mã nguồn trên GitHub</span>
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                  <Icon icon="solar:info-circle-line-duotone" className="text-base text-vanixjnk" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thông số kỹ thuật</h3>
                </div>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-muted-foreground">Phiên bản hiện tại</span>
                    <span className="font-bold text-foreground font-mono">{product.version}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-muted-foreground">Giấy phép bản quyền</span>
                    <span className="font-bold text-foreground">{getLicenseLabel(product.licenseType)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-border/30">
                    <span className="text-muted-foreground">Hỗ trợ kỹ thuật</span>
                    <span className="font-bold text-foreground">Trong {product.supportMonths} tháng</span>
                  </div>

                  {product.fileSize && (
                    <div className="flex justify-between items-center py-1 border-b border-border/30">
                      <span className="text-muted-foreground">Kích thước file</span>
                      <span className="font-bold text-foreground font-mono">{product.fileSize}</span>
                    </div>
                  )}

                  {product.compatibility && product.compatibility.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1">
                      <span className="text-muted-foreground">Khả năng tương thích</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.compatibility.map((comp, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-xs font-semibold bg-muted/30 border border-border/50 text-foreground"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                  <Icon icon="solar:ranking-line-duotone" className="text-base text-vanixjnk" />
                  <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Chỉ số thống kê</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-lg bg-muted/15 border border-border/50 flex items-center gap-3">
                    <div className="size-8 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                      <Icon icon="solar:cloud-download-line-duotone" className="size-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lượt tải xuống</span>
                      <span className="text-sm font-black text-foreground mt-0.5">{product.downloadCount}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/15 border border-border/50 flex items-center gap-3">
                    <div className="size-8 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <Icon icon="solar:cart-large-4-line-duotone" className="size-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Số đơn hàng thành công</span>
                      <span className="text-sm font-black text-foreground mt-0.5">{product.salesCount}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/15 border border-border/50 flex items-center gap-3">
                    <div className="size-8 rounded-lg text-blue-500 bg-blue-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                      <Icon icon="solar:eye-line-duotone" className="size-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lượt xem tài liệu</span>
                      <span className="text-sm font-black text-foreground mt-0.5">{product.viewsCount}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
