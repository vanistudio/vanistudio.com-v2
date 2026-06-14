"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import type { Service, ServiceType } from "@/server/db/schemas/service.schema";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function PubServicesList({
  initialServices,
  categories,
}: {
  initialServices: (Service & { serviceType: ServiceType | null })[];
  categories: ServiceType[];
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categoriesList = useMemo(() => {
    return [
      { id: "all", name: "Tất cả", icon: "solar:widget-line-duotone" },
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon || "solar:widget-line-duotone",
      })),
    ];
  }, [categories]);

  const filteredServices = useMemo(() => {
    return initialServices.filter((service) => {
      const matchesFilter =
        activeFilter === "all" ||
        (service.serviceType && service.serviceType.id === activeFilter);

      const matchesPrice = (() => {
        if (priceFilter === "all") return true;
        if (priceFilter === "contact") {
          return service.priceType === "contact";
        }
        if (service.priceType === "contact") return false;

        const price = service.basePrice || 0;
        if (priceFilter === "under-5m") {
          return price < 5000000;
        }
        if (priceFilter === "5m-15m") {
          return price >= 5000000 && price <= 15000000;
        }
        if (priceFilter === "15m-50m") {
          return price >= 15000000 && price <= 50000000;
        }
        if (priceFilter === "above-50m") {
          return price > 50000000;
        }
        return true;
      })();

      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        service.technologies.some((tech) => {
          const cleanTech = tech.replace("devicon:", "").replace("-wordmark", "");
          return cleanTech.toLowerCase().includes(searchQuery.toLowerCase());
        });
      return matchesFilter && matchesPrice && matchesSearch;
    });
  }, [initialServices, activeFilter, priceFilter, searchQuery]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:case-round-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Dịch Vụ Cung Cấp</h1>
              <p className="text-sm text-muted-foreground">
                Chúng tôi cung cấp các giải pháp thiết kế, lập trình và chuyển đổi số chuyên nghiệp, toàn diện theo yêu cầu.
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
          
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <div className="flex items-center gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground z-10">
                  <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 text-xs"
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-10 w-10 border-border bg-background hover:bg-muted/50 shrink-0",
                      (activeFilter !== "all" || priceFilter !== "all") && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                    )}
                    title="Lọc dịch vụ"
                  >
                    <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3 flex flex-col gap-3.5" align="end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
                      Phân loại
                    </label>
                    <Select value={activeFilter} onValueChange={setActiveFilter}>
                      <SelectTrigger className="w-full h-9 justify-between bg-background border-border text-xs">
                        <SelectValue placeholder="Chọn phân loại" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {categoriesList.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">
                            <span className="flex items-center gap-2">
                              <Icon icon={cat.icon} className="size-3.5 shrink-0" />
                              <span>{cat.name}</span>
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
                      <SelectTrigger className="w-full h-9 justify-between bg-background border-border text-xs">
                        <SelectValue placeholder="Chọn mức giá" />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        <SelectItem value="all" className="text-xs">
                          <span className="flex items-center gap-2">
                            <Icon icon="solar:banknote-line-duotone" className="size-3.5 shrink-0 text-slate-500" />
                            <span>Tất cả mức giá</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="contact" className="text-xs">
                          <span className="flex items-center gap-2">
                            <Icon icon="solar:chat-round-money-line-duotone" className="size-3.5 shrink-0 text-indigo-500" />
                            <span>Thỏa thuận</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="under-5m" className="text-xs">
                          <span className="flex items-center gap-2">
                            <Icon icon="solar:card-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                            <span>Dưới 5 triệu VNĐ</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="5m-15m" className="text-xs">
                          <span className="flex items-center gap-2">
                            <Icon icon="solar:wallet-money-line-duotone" className="size-3.5 shrink-0 text-sky-500" />
                            <span>5 triệu - 15 triệu VNĐ</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="15m-50m" className="text-xs">
                          <span className="flex items-center gap-2">
                            <Icon icon="solar:money-bag-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                            <span>15 triệu - 50 triệu VNĐ</span>
                          </span>
                        </SelectItem>
                        <SelectItem value="above-50m" className="text-xs">
                          <span className="flex items-center gap-2">
                            <Icon icon="solar:crown-line-duotone" className="size-3.5 shrink-0 text-rose-500" />
                            <span>Trên 50 triệu VNĐ</span>
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <div className="size-16 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
                <Icon icon="solar:folder-error-line-duotone" className="text-3xl text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base text-foreground">Không tìm thấy dịch vụ nào</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác để tìm kiếm dịch vụ bạn cần.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => {
                const meta = getServiceTypeMeta(service.serviceType);
                const solidBg = getSolidBgClass(meta.bg);
                return (
                  <Card key={service.id} className="group relative flex flex-col h-full bg-card/30 border-border p-0!">
                    <div className="absolute top-[-6px] right-3 z-20 w-8 h-12 pointer-events-none">
                      <div 
                        className={cn(
                          "absolute top-0 left-[-4px] w-1 h-[6px]",
                          solidBg
                        )}
                        style={{
                          clipPath: "polygon(100% 0, 100% 100%, 0% 100%)",
                          filter: "brightness(0.55)"
                        }}
                      />
                      <div 
                        className={cn(
                          "absolute top-0 right-[-4px] w-1 h-[6px]",
                          solidBg
                        )}
                        style={{
                          clipPath: "polygon(0 0, 0 100%, 100% 100%)",
                          filter: "brightness(0.55)"
                        }}
                      />
                      <div 
                        className={cn(
                          "relative w-8 h-11 shadow-[0_4px_8px_rgba(0,0,0,0.35)] flex flex-col justify-between rounded-t-[1px]",
                          solidBg
                        )}
                        style={{
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
                              ? `Từ ${formatPrice(service.basePrice)}`
                              : formatPrice(service.basePrice)}
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
          )}
        </div>
      </div>
    </div>
  );
}
