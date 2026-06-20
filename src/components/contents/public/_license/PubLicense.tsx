"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";
import Link from "next/link";

export default function PubLicense() {
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const checkMutation = trpc.tools.checkLicense.useMutation();

  const handleCheck = async () => {
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập tên miền hoặc địa chỉ IP để kiểm tra");
      return;
    }

    setResult(null);
    setErrorMsg(null);

    try {
      const data = await checkMutation.mutateAsync({
        query: searchQuery.trim(),
      });
      setResult(data);
      toast.success("Kiểm tra bản quyền thành công!");
    } catch (err: any) {
      setErrorMsg(err.message || "Không tìm thấy bản quyền đăng ký cho tên miền hoặc IP này");
      toast.error(err.message || "Kiểm tra thất bại");
    }
  };

  const getStatusMeta = (status: string) => {
    const variants: Record<string, { label: string; color: string; icon: string; bg: string; border: string }> = {
      activated: {
        label: "Đã kích hoạt",
        color: "text-emerald-500 dark:text-emerald-400",
        icon: "solar:shield-check-bold-duotone",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      },
      not_activated: {
        label: "Chưa kích hoạt",
        color: "text-amber-500 dark:text-amber-400",
        icon: "solar:shield-warning-bold-duotone",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      },
      suspended: {
        label: "Tạm khóa",
        color: "text-orange-500 dark:text-orange-400",
        icon: "solar:lock-keyhole-bold-duotone",
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
      },
      expired: {
        label: "Hết hạn",
        color: "text-rose-500 dark:text-rose-400",
        icon: "solar:clock-circle-bold-duotone",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
      },
      revoked: {
        label: "Đã hủy bỏ",
        color: "text-red-500 dark:text-red-400",
        icon: "solar:slash-circle-bold-duotone",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
      },
    };

    return (
      variants[status] || {
        label: status || "Không xác định",
        color: "text-muted-foreground",
        icon: "solar:help-bold-duotone",
        bg: "bg-muted",
        border: "border-border",
      }
    );
  };

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Header Area */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:verified-check-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Tra cứu Bản quyền</h1>
              <p className="text-sm text-muted-foreground">
                Xác thực giấy phép phần mềm, kiểm tra thời hạn và giới hạn thiết bị của các sản phẩm Vani Studio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Stripe */}
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

      {/* Main Form and Content */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 sm:p-8">
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
            
            {/* Input Card */}
            <Card className="p-6 border border-border/80 bg-card/50 shadow-md">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground">
                  Nhập tên miền hoặc địa chỉ IP để kiểm tra
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Icon
                      icon="solar:globus-linear"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base"
                    />
                    <Input
                      type="text"
                      placeholder="Ví dụ: myclient.com, 103.82.20.1..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-9 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                    />
                  </div>
                  <Button
                    variant="vanixjnk"
                    onClick={handleCheck}
                    disabled={checkMutation.isPending}
                    className="h-10 px-5 text-xs font-bold shrink-0 cursor-pointer gap-1.5"
                  >
                    {checkMutation.isPending ? (
                      <Icon icon="solar:restart-line-duotone" className="animate-spin size-4" />
                    ) : (
                      <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                    )}
                    <span>Kiểm tra</span>
                  </Button>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Hệ thống sẽ tra cứu bản quyền phần mềm Vani Studio được cấp phép chạy trên tên miền hoặc IP này.
                </span>
              </div>
            </Card>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-5 border border-rose-500/20 bg-rose-500/5 rounded-2xl flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
                  <Icon icon="solar:danger-triangle-bold-duotone" className="size-5" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <h4 className="text-sm font-bold text-rose-500">Không tìm thấy bản quyền</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Status Card */}
                <div className={cn(
                  "p-5 border rounded-2xl flex items-center justify-between gap-4",
                  getStatusMeta(result.status).bg,
                  getStatusMeta(result.status).border
                )}>
                  <div className="flex items-center gap-3.5">
                    <div className={cn(
                      "size-12 rounded-xl flex items-center justify-center shrink-0 border",
                      getStatusMeta(result.status).bg.replace("/10", "/20"),
                      getStatusMeta(result.status).border
                    )}>
                      <Icon icon={getStatusMeta(result.status).icon} className={cn("size-6", getStatusMeta(result.status).color)} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái bản quyền</span>
                      <h4 className={cn("text-base font-bold", getStatusMeta(result.status).color)}>
                        {getStatusMeta(result.status).label}
                      </h4>
                    </div>
                  </div>
                  <Badge variant={
                    result.status === "activated" ? "success" :
                    result.status === "not_activated" ? "secondary" :
                    result.status === "suspended" ? "outline" : "danger"
                  } className="h-6">
                    {result.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Match Connection Info */}
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Icon icon="solar:shield-check-line-duotone" className="size-4 shrink-0" />
                  <span>
                    Khớp kết nối đang kiểm tra: <strong className="font-mono text-xs text-foreground bg-emerald-500/10 px-1.5 py-0.5 rounded-md">{result.checkedValue}</strong>
                  </span>
                </div>

                {/* Information Card */}
                <Card className="p-6 border border-border/80 bg-card/50 shadow-md flex flex-col gap-6">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-sm font-bold text-foreground border-b pb-2">Thông tin giấy phép chi tiết</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Name */}
                      <div className="flex flex-col gap-1 p-3.5 border bg-muted/20 rounded-xl hover:shadow-xs transition-shadow">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sản phẩm cấp phép</span>
                        <span className="text-sm font-bold text-foreground">{result.productName}</span>
                      </div>

                      {/* Owner Info */}
                      <div className="flex flex-col gap-1 p-3.5 border bg-muted/20 rounded-xl hover:shadow-xs transition-shadow">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Người sở hữu (Owner)</span>
                        <span className="text-sm font-bold text-foreground truncate">
                          {result.ownerName} <span className="text-[11px] text-muted-foreground font-mono">({result.ownerEmail})</span>
                        </span>
                      </div>

                      {/* Devices Limit */}
                      <div className="flex flex-col gap-1 p-3.5 border bg-muted/20 rounded-xl hover:shadow-xs transition-shadow">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Giới hạn thiết bị kích hoạt</span>
                        <span className="text-sm font-bold text-foreground font-mono">
                          {result.activationCount} / {result.maxActivations} thiết bị
                        </span>
                      </div>

                      {/* Expiration date */}
                      <div className="flex flex-col gap-1 p-3.5 border bg-muted/20 rounded-xl hover:shadow-xs transition-shadow">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thời hạn sử dụng</span>
                        <span className="text-sm font-bold text-foreground">
                          {result.expiresAt ? (
                            <span className="font-mono text-xs">
                              {formatWithSiteTimezone(result.expiresAt, siteTimezone, "HH:mm:ss - DD/MM/YYYY")}
                            </span>
                          ) : (
                            <span className="text-vanixjnk flex items-center gap-1">
                              <Icon icon="solar:infinity-bold" className="size-4 shrink-0" />
                              <span>Vĩnh viễn (Trọn đời)</span>
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Created date */}
                      <div className="flex flex-col gap-1 p-3.5 border bg-muted/20 rounded-xl hover:shadow-xs transition-shadow">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ngày cấp phát (Cấp khóa)</span>
                        <span className="text-sm font-bold text-foreground font-mono text-xs">
                          {formatWithSiteTimezone(result.createdAt, siteTimezone, "HH:mm:ss - DD/MM/YYYY")}
                        </span>
                      </div>

                      {/* Last activation date */}
                      <div className="flex flex-col gap-1 p-3.5 border bg-muted/20 rounded-xl hover:shadow-xs transition-shadow">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thời gian kích hoạt gần nhất</span>
                        <span className="text-sm font-bold text-foreground">
                          {result.activatedAt ? (
                            <span className="font-mono text-xs">
                              {formatWithSiteTimezone(result.activatedAt, siteTimezone, "HH:mm:ss - DD/MM/YYYY")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Chưa thực hiện kích hoạt</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Limits Section */}
                  <div className="flex flex-col gap-4 border-t pt-5">
                    <h4 className="text-sm font-bold text-foreground">Quy tắc & Giới hạn kết nối (IP/Domain Rules)</h4>
                    
                    <div className="flex flex-col gap-4">
                      {/* Allowed Domains */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-foreground">Danh sách tên miền được phép (Allowed Domains)</span>
                        {result.allowedDomains && result.allowedDomains.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {result.allowedDomains.map((dom: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="font-mono text-[10px] py-1 px-2.5 rounded-lg border">
                                {dom}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium bg-muted/30 p-2.5 rounded-xl border border-dashed">
                            <Icon icon="solar:globus-line-duotone" className="size-4 text-emerald-500" />
                            <span>Không giới hạn tên miền (Chạy trên mọi host)</span>
                          </span>
                        )}
                      </div>

                      {/* Allowed IPs */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-foreground">Danh sách địa chỉ IP được phép (Allowed IPs)</span>
                        {result.allowedIps && result.allowedIps.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {result.allowedIps.map((ip: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="font-mono text-[10px] py-1 px-2.5 rounded-lg border">
                                {ip}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium bg-muted/30 p-2.5 rounded-xl border border-dashed">
                            <Icon icon="solar:checklist-minimalistic-line-duotone" className="size-4 text-emerald-500" />
                            <span>Không giới hạn IP kết nối (Không khóa máy chủ)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Back to Home / Tools link */}
            <div className="flex justify-center items-center gap-4 mt-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <Icon icon="solar:home-2-line-duotone" className="mr-1.5 size-4" />
                  Trang chủ
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  <Icon icon="solar:tuning-square-2-line-duotone" className="mr-1.5 size-4" />
                  Công cụ khác
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
