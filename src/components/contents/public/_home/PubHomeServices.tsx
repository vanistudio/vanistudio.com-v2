"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Service, ServiceType } from "@/server/db/schemas/service.schema";

interface PubHomeServicesProps {
  initialServices: (Service & { serviceType: ServiceType | null })[];
}

const getServiceTypeMeta = (typeObj: ServiceType | null) => {
  if (!typeObj) {
    return {
      label: "Khác",
      icon: "solar:menu-dots-square-line-duotone",
      color: "text-zinc-500",
      bg: "bg-zinc-500/10",
      border: "border-zinc-500/20",
    };
  }
  return {
    label: typeObj.name,
    icon: typeObj.icon || "solar:menu-dots-square-line-duotone",
    color: typeObj.color || "text-zinc-500",
    bg: typeObj.bg || "bg-zinc-500/10",
    border: typeObj.border || "border-zinc-500/20",
  };
};

const getSolidBgClass = (bgClass: string) => {
  if (!bgClass) return "bg-primary";
  return bgClass.split("/")[0] || "bg-primary";
};

const getSolidBgColor = (bgClass: string): string | undefined => {
  if (!bgClass) return undefined;
  const match = bgClass.match(/bg-([a-z]+)(?:-([0-9]+))?/);
  if (!match) return undefined;
  const color = match[1];
  const shade = match[2] || "500";
  const colors: Record<string, Record<string, string>> = {
    blue: { "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8" },
    violet: { "400": "#a78bfa", "500": "#8b5cf6", "600": "#7c3aed", "700": "#6d28d9" },
    amber: { "400": "#fbbf24", "500": "#f59e0b", "600": "#d97706", "700": "#b45309" },
    green: { "400": "#4ade80", "500": "#22c55e", "600": "#16a34a", "700": "#15803d" },
    rose: { "400": "#fb7185", "500": "#f43f5e", "600": "#e11d48", "700": "#be123c" },
    cyan: { "400": "#22d3ee", "500": "#06b6d4", "600": "#0891b2", "700": "#0e7490" },
    zinc: { "400": "#a1a1aa", "500": "#71717a", "600": "#52525b", "700": "#3f3f46" },
    slate: { "400": "#94a3b8", "500": "#64748b", "600": "#475569", "700": "#334155" },
    emerald: { "400": "#34d399", "500": "#10b981", "600": "#059669", "700": "#047857" },
    sky: { "400": "#38bdf8", "500": "#0ea5e9", "600": "#0284c7", "700": "#0369a1" },
    indigo: { "400": "#818cf8", "500": "#6366f1", "600": "#4f46e5", "700": "#4338ca" },
    purple: { "400": "#c084fc", "500": "#a855f7", "600": "#9333ea", "700": "#7e22ce" },
    pink: { "400": "#f472b6", "500": "#ec4899", "600": "#db2777", "700": "#be185d" },
    red: { "400": "#f87171", "500": "#ef4444", "600": "#dc2626", "700": "#b91c1c" },
    orange: { "400": "#fb923c", "500": "#f97316", "600": "#ea580c", "700": "#c2410c" },
    yellow: { "400": "#facc15", "500": "#eab308", "600": "#ca8a04", "700": "#a16207" },
  };
  return colors[color]?.[shade] || colors[color]?.[500];
};

const formatPriceVND = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PubHomeServices({ initialServices }: PubHomeServicesProps) {
  if (initialServices.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto">
        <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-2.5">
          <Icon icon="solar:window-frame-line-duotone" className="text-2xl" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-vanixjnk">Our Services</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Dịch vụ công nghệ nổi bật
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialServices.map((service) => {
          const meta = getServiceTypeMeta(service.serviceType);
          const solidBg = getSolidBgClass(meta.bg);
          const solidColor = getSolidBgColor(meta.bg);
          return (
            <Card key={service.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0!">
              <div className="absolute top-[-6px] right-3 z-20 w-8 h-12 pointer-events-none">
                <div 
                  className={cn(
                    "absolute top-[6px] left-[-4px] w-1 h-[6px]",
                    !solidColor && solidBg
                  )}
                  style={{
                    backgroundColor: solidColor,
                    clipPath: "polygon(100% 0, 100% 100%, 0% 100%)",
                    filter: "brightness(0.55)"
                  }}
                />
                <div 
                  className={cn(
                    "absolute top-[6px] right-[-4px] w-1 h-[6px]",
                    !solidColor && solidBg
                  )}
                  style={{
                    backgroundColor: solidColor,
                    clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                    filter: "brightness(0.55)"
                  }}
                />
                <div 
                  className={cn(
                    "relative w-8 h-11 shadow-[0_4px_8px_rgba(0,0,0,0.35)] flex flex-col justify-between rounded-t-[1px]",
                    !solidColor && solidBg
                  )}
                  style={{
                    backgroundColor: solidColor,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 82%, 0% 100%)",
                    backgroundImage: "linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(0, 0, 0, 0.2))",
                    backgroundBlendMode: "overlay"
                  }}
                >
                  <div className="w-full h-[6px] bg-black/15 border-b border-black/10" />

                  <div className="flex-1 flex items-center justify-center -mt-1.5">
                    <Icon icon={meta.icon} className="size-5 text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]" />
                  </div>
                </div>
              </div>

              <Link
                href={`/services/${service.slug}`}
                className="flex flex-col h-full"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-muted/20 border-b border-border/55 flex items-center justify-center">
                  {service.thumbnail ? (
                    <img
                      src={service.thumbnail}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-vanixjnk/5 to-vanixjnk/15 flex items-center justify-center">
                      <Icon icon={meta.icon} className={`text-5xl ${meta.color || "text-primary"} opacity-40`} />
                    </div>
                  )}
                  <div 
                    className={cn(
                      "absolute bottom-2 right-2 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase shadow-md border z-10 select-none bg-background/80 backdrop-blur-md",
                      meta.color,
                      meta.bg,
                      meta.border
                    )}
                  >
                    {meta.label}
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{service.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {service.description || "Chưa có mô tả ngắn gọn cho dịch vụ này."}
                    </p>
                  </div>

                  <div className="flex-1 mt-2">
                    <ul className="space-y-1.5">
                      {service.features && service.features.slice(0, 5).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Icon icon="solar:verified-check-line-duotone" className="text-emerald-500 text-sm shrink-0 mt-0.5" />
                          <span>{feat.name}</span>
                        </li>
                      ))}
                      {service.features && service.features.length > 5 && (
                        <li className="text-[10px] text-muted-foreground/60 pl-5">
                          +{service.features.length - 5} tính năng khác
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-border px-5 py-4 flex items-center justify-between bg-muted/10 rounded-b-xl group-hover:bg-muted/15 transition-colors">
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      {service.priceType === "contact"
                        ? "Thỏa thuận"
                        : service.priceType === "starting_at"
                        ? `Từ ${formatPriceVND(service.basePrice)}`
                        : formatPriceVND(service.basePrice)}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {service.priceType === "contact" ? "/ dịch vụ" : "/ dự án"}
                    </span>
                  </div>
                  <div className="relative flex items-center justify-end h-8 min-w-[85px] overflow-hidden">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground group-hover:-translate-y-8 group-hover:opacity-0 transition-all duration-300">
                      <Icon icon="solar:clock-circle-line-duotone" className="text-xs" />
                      {service.deliveryTime ? `~${service.deliveryTime} ngày` : "Thỏa thuận"}
                    </div>
                    <div className="absolute flex items-center gap-1 text-[13px] font-bold text-vanixjnk translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span>Chi tiết</span>
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
          <Link href="/services">
            <Icon icon="solar:window-frame-line-duotone" className="text-base shrink-0" />
            <span>Xem tất cả dịch vụ</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}
