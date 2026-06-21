"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";
import Link from "next/link";

const statusMap: Record<
  string,
  { label: string; color: string; bg: string; icon: string; verified: boolean }
> = {
  activated: {
    label: "Đã xác minh",
    color: "text-emerald-500",
    bg: "border-emerald-500/30 bg-emerald-500/5",
    icon: "solar:verified-check-bold",
    verified: true,
  },
  not_activated: {
    label: "Chưa kích hoạt",
    color: "text-muted-foreground",
    bg: "border-border bg-muted/10",
    icon: "solar:minus-circle-line-duotone",
    verified: false,
  },
  suspended: {
    label: "Đã thu hồi",
    color: "text-destructive",
    bg: "border-destructive/30 bg-destructive/5",
    icon: "solar:close-circle-line-duotone",
    verified: false,
  },
  expired: {
    label: "Hết hạn",
    color: "text-amber-500",
    bg: "border-amber-500/30 bg-amber-500/5",
    icon: "solar:clock-circle-line-duotone",
    verified: false,
  },
  revoked: {
    label: "Đã thu hồi",
    color: "text-destructive",
    bg: "border-destructive/30 bg-destructive/5",
    icon: "solar:close-circle-line-duotone",
    verified: false,
  },
};

export default function PubLicense() {
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const licenseQuery = trpc.tools.checkLicense.useQuery(
    { query: activeSearch },
    {
      enabled: activeSearch.length > 0,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery
      .trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .split("/")[0]
      .split(":")[0];

    if (!clean) {
      toast.error("Vui lòng nhập tên miền hoặc địa chỉ IP hợp lệ!");
      return;
    }

    setActiveSearch(clean);
  };

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "—";
    try {
      return formatWithSiteTimezone(dateStr, siteTimezone, "DD/MM/YYYY");
    } catch {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[100px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3 bg-background/60 backdrop-blur-md">
              <Icon icon="solar:verified-check-line-duotone" className="text-3xl" />
            </div>

            <div className="flex flex-col items-center gap-2 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Xác Minh Giấy Phép</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Nhập tên miền website hoặc địa chỉ IP để kiểm tra giấy phép hoạt động được cấp bởi Vani Studio.
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

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 lg:p-8">
          
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start grow my-4">
            
            {/* Left Column: Form & Info */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Card className="p-5 bg-card/30 border-border w-full">
                <form onSubmit={handleSearch} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="searchQuery" className="text-xs font-bold text-foreground">
                      Tên miền hoặc địa chỉ IP cần xác minh
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 flex items-center">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                          <Icon icon="solar:global-line-duotone" className="size-4" />
                        </span>
                        <Input
                          id="searchQuery"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-10"
                          placeholder="Ví dụ: example.com, 103.82.20.1..."
                          disabled={licenseQuery.isFetching}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            title="Xóa nhập liệu"
                          >
                            <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                          </button>
                        )}
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        variant="vanixjnk"
                        className="font-bold text-xs shrink-0 px-4"
                        disabled={licenseQuery.isFetching || !searchQuery.trim()}
                      >
                        {licenseQuery.isFetching ? (
                          <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin" />
                        ) : (
                          <>
                            <Icon icon="solar:shield-check-line-duotone" className="size-4 mr-1.5" />
                            <span>Xác minh</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>

              {/* Guide Card */}
              <div className="p-5 rounded-xl border border-border bg-card/20 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-vanixjnk font-bold text-xs">
                  <Icon icon="solar:info-circle-line-duotone" className="text-base shrink-0" />
                  <span>Hướng dẫn xác minh</span>
                </div>
                <div className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
                  <p>Hệ thống hỗ trợ xác minh các tên miền (Domain) và địa chỉ IP của máy chủ chạy sản phẩm.</p>
                  <p>Tên miền cần nhập không chứa tiền tố <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">http://</code> hoặc <code className="text-foreground bg-muted px-1.5 py-0.5 rounded font-mono">https://</code>.</p>
                  <p>Nếu gặp sự cố về bản quyền hoặc cần đăng ký giấy phép mới, vui lòng liên hệ <Link href="/contact" className="text-foreground underline hover:text-vanixjnk transition-colors font-semibold">Bộ phận hỗ trợ</Link>.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Search Results */}
            <div className="lg:col-span-7 flex flex-col gap-6 w-full">
              {licenseQuery.isFetching && (
                <div className="flex flex-col gap-4 w-full">
                  <div className="h-32 rounded-xl bg-card/30 border border-border animate-pulse" />
                  <div className="h-56 rounded-xl bg-card/30 border border-border animate-pulse" />
                </div>
              )}

              {licenseQuery.isError && !licenseQuery.isFetching && (
                <div className="flex flex-col items-center justify-center gap-3 w-full py-8 border border-dashed border-destructive/20 rounded-xl bg-destructive/5 text-center min-h-[300px]">
                  <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20 text-destructive mb-2">
                    <Icon icon="solar:shield-warning-line-duotone" className="text-4xl" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-destructive mb-1">Không tìm thấy giấy phép</p>
                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                      {licenseQuery.error.message || "Tên miền hoặc địa chỉ IP này chưa được cấp giấy phép hoạt động hoặc đã bị thu hồi khỏi hệ thống."}
                    </p>
                  </div>
                </div>
              )}

              {!licenseQuery.data && !licenseQuery.isFetching && !licenseQuery.isError && (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/80 rounded-xl bg-card/5 text-center min-h-[300px]">
                  <Icon icon="solar:shield-check-line-duotone" className="text-5xl text-vanixjnk/40 mb-3 animate-pulse" />
                  <h4 className="text-xs font-bold text-foreground mb-1">Hệ thống sẵn sàng</h4>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                    Nhập thông tin tên miền hoặc địa chỉ IP ở cột bên trái để truy xuất trạng thái giấy phép hoạt động thời gian thực từ Vani Studio License Server.
                  </p>
                </div>
              )}

              {licenseQuery.data && !licenseQuery.isFetching && (
                <div className="flex flex-col gap-4 w-full">
                  {(() => {
                    const statusInfo = statusMap[licenseQuery.data.status] || {
                      label: licenseQuery.data.status || "Không xác định",
                      color: "text-muted-foreground",
                      bg: "border-border bg-muted/10",
                      icon: "solar:minus-circle-line-duotone",
                      verified: false,
                    };
                    return (
                      <div className={cn("flex flex-col items-center gap-3 p-6 rounded-xl border backdrop-blur-md", statusInfo.bg)}>
                        <div className="relative">
                          <Icon icon={statusInfo.icon} className={cn("text-5xl", statusInfo.color)} />
                          {statusInfo.verified && (
                            <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background border border-border">
                              <Icon icon="solar:check-circle-bold" className="text-lg text-emerald-500" />
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className={cn("text-base font-bold", statusInfo.color)}>{statusInfo.label}</p>
                          {statusInfo.verified ? (
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                              Website này đã được <span className="text-foreground font-medium">Vani Studio</span> cấp giấy phép hoạt động hợp lệ.
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                              Giấy phép cho website này hiện {licenseQuery.data.status === "expired" ? "đã hết hạn" : licenseQuery.data.status === "revoked" ? "đã bị thu hồi" : "chưa được kích hoạt"}.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rounded-xl border border-border bg-card/30 overflow-hidden">
                    {[
                      { icon: "solar:global-line-duotone", label: "Tên miền / IP", value: licenseQuery.data.checkedValue || "—", color: "text-sky-500" },
                      { 
                        icon: "solar:box-line-duotone", 
                        label: "Sản phẩm", 
                        value: (
                          <Link 
                            href={`/products/${licenseQuery.data.productSlug}`} 
                            className="hover:text-vanixjnk transition-colors underline decoration-dotted font-semibold"
                          >
                            {licenseQuery.data.productName}
                          </Link>
                        ),
                        color: "text-purple-500"
                      },
                      { icon: "solar:user-line-duotone", label: "Chủ sở hữu", value: `${licenseQuery.data.ownerName} (${licenseQuery.data.ownerEmail})`, color: "text-teal-500" },
                      { icon: "solar:calendar-line-duotone", label: "Ngày cấp phép", value: formatDate(licenseQuery.data.activatedAt || licenseQuery.data.createdAt), color: "text-amber-500" },
                      { icon: "solar:calendar-mark-line-duotone", label: "Hiệu lực đến", value: licenseQuery.data.expiresAt ? formatDate(licenseQuery.data.expiresAt) : "Vĩnh viễn", color: "text-emerald-500" },
                    ].map((item, i) => (
                      <div key={item.label} className={cn("flex items-center gap-3 px-4 py-3", i < 4 && "border-b border-border")}>
                        <Icon icon={item.icon} className={cn("text-lg shrink-0", item.color)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                          <div className="text-sm font-medium text-foreground truncate">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center">
                    Kết quả xác minh bởi hệ thống Vani Studio License Server
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
