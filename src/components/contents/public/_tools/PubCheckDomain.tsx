"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

export default function PubCheckDomain() {
  const [domainInput, setDomainInput] = useState("");
  const [activeDomain, setActiveDomain] = useState("");

  const domainQuery = trpc.tools.checkDomain.useQuery(
    { domain: activeDomain },
    {
      enabled: activeDomain.length > 0,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = domainInput
      .trim()
      .toLowerCase()
      .replace(/^(https?:\/\/)?(www\.)?/, "")
      .split("/")[0]
      .split(":")[0];
      
    if (!clean) {
      toast.error("Vui lòng nhập tên miền hợp lệ!");
      return;
    }
    
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(clean)) {
      toast.error("Định dạng tên miền không hợp lệ!");
      return;
    }

    setActiveDomain(clean);
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const getExpiryProgress = (creationStr?: string, expiryStr?: string) => {
    if (!creationStr || !expiryStr) return null;
    const creation = new Date(creationStr);
    const expiry = new Date(expiryStr);
    const now = new Date();

    if (isNaN(creation.getTime()) || isNaN(expiry.getTime())) return null;

    const total = expiry.getTime() - creation.getTime();
    const elapsed = now.getTime() - creation.getTime();
    
    if (total <= 0) return 0;
    
    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const remainingDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      percentage,
      remainingDays,
      isExpired: remainingDays <= 0,
      isCritical: remainingDays > 0 && remainingDays <= 30,
    };
  };

  const whois = domainQuery.data?.whois;
  const dns = domainQuery.data?.dns;
  const ssl = domainQuery.data?.ssl;
  const http = domainQuery.data?.http;
  const geo = domainQuery.data?.geo;
  const progress = whois ? getExpiryProgress(whois.creationDate, whois.expiryDate) : null;

  const hasRegistrantData = whois && (
    whois.registrantName ||
    whois.registrantOrganization ||
    whois.registrantEmail ||
    whois.registrantPhone ||
    whois.registrantCountry
  );

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[100px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:global-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Tra Cứu WHOIS & DNS Tên Miền</h1>
              <p className="text-sm text-muted-foreground">
                Phân tích sâu thông tin đăng ký, ngày hết hạn tên miền, chứng chỉ SSL, hiệu năng máy chủ và hệ thống bản ghi DNS.
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

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <Card className="p-5 bg-card/30 border-border w-full">
            <form onSubmit={handleSearch} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="domain" className="text-xs font-bold text-foreground">
                  Nhập tên miền cần tra cứu
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1 flex items-center">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                      <Icon icon="solar:link-line-duotone" className="size-4" />
                    </span>
                    <Input
                      id="domain"
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      className="pl-9 pr-10 text-xs"
                      placeholder="Ví dụ: google.com, vanistudio.vn..."
                      disabled={domainQuery.isFetching}
                    />
                    {domainInput && (
                      <button
                        type="button"
                        onClick={() => setDomainInput("")}
                        className="absolute right-3 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        title="Xóa nhập liệu"
                      >
                        <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size={"lg"}
                    variant="vanixjnk"
                    className="font-bold text-xs shrink-0 px-5 rounded-lg"
                    disabled={domainQuery.isFetching}
                  >
                    {domainQuery.isFetching ? (
                      <>
                        <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin" />
                        <span>Đang phân tích...</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="solar:magnifer-line-duotone" className="size-4" />
                        <span>Tra cứu</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
          {domainQuery.isFetching && (
            <div className="flex flex-col gap-6 w-full mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <div className="h-44 rounded-xl bg-card/30 border border-border" />
                  <div className="h-32 rounded-xl bg-card/30 border border-border" />
                  <div className="h-64 rounded-xl bg-card/30 border border-border" />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="h-48 rounded-xl bg-card/30 border border-border" />
                  <div className="h-56 rounded-xl bg-card/30 border border-border" />
                </div>
              </div>
            </div>
          )}
          {domainQuery.isError && !domainQuery.isFetching && (
            <Card className="p-6 border-red-500/25 bg-red-500/5 w-full text-center flex flex-col items-center justify-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-xl text-red-500 bg-red-500/10 border border-red-500/25 shrink-0">
                <Icon icon="solar:danger-triangle-line-duotone" className="text-2xl" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-sm text-foreground">Lỗi phân tích tên miền</h4>
                <p className="text-xs text-muted-foreground">
                  {domainQuery.error.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau."}
                </p>
              </div>
            </Card>
          )}
          {domainQuery.data && !domainQuery.isFetching && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tên miền</span>
                      <h2 className="text-xl font-black text-foreground tracking-tight">{whois?.domainName || activeDomain.toUpperCase()}</h2>
                    </div>
                    {whois?.available ? (
                      <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">
                        Chưa đăng ký (Available)
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="text-[10px] px-2 py-0.5 font-bold">
                        Đã đăng ký (Registered)
                      </Badge>
                    )}
                  </div>

                  {whois?.available ? (
                    <div className="text-center py-6 text-sm text-muted-foreground flex flex-col items-center gap-2">
                      <Icon icon="solar:verified-check-line-duotone" className="size-12 text-green-500" />
                      <span>Chúc mừng! Tên miền <strong>{activeDomain}</strong> chưa được đăng ký và có thể mua được.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/15 border border-border/55">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nhà đăng ký (Registrar)</span>
                        <span className="text-foreground font-semibold">{whois?.registrar || "Không rõ"}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/15 border border-border/55">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trạng thái (Domain Status)</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {whois?.statuses && whois.statuses.length > 0 ? (
                            whois.statuses.map((st, idx) => (
                              <Badge key={idx} variant="outline" className="text-[10px] capitalize bg-background/50 py-0 px-1.5 font-semibold">
                                {st}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-foreground font-semibold">Active / OK</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
                {whois && !whois.available && (whois.creationDate || whois.expiryDate) && (
                  <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                      <Icon icon="solar:calendar-line-duotone" className="text-base text-vanixjnk" />
                      <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thời gian hiệu lực tên miền</h3>
                    </div>
                    
                    {progress && (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Độ dài vòng đời đã sử dụng</span>
                          <span className={cn("font-bold", progress.isCritical ? "text-amber-500" : "text-foreground")}>
                            {progress.isExpired 
                              ? "Đã hết hạn" 
                              : `Còn lại ${progress.remainingDays.toLocaleString()} ngày (${formatDistanceToNow(new Date(whois.expiryDate), { locale: vi, addSuffix: false })})`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              progress.isExpired 
                                ? "bg-red-500" 
                                : progress.isCritical 
                                ? "bg-amber-500" 
                                : "bg-vanixjnk"
                            )}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ngày đăng ký</span>
                        <span className="text-foreground font-semibold">
                          {whois.creationDate ? format(new Date(whois.creationDate), "dd/MM/yyyy HH:mm") : "Không rõ"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ngày cập nhật cuối</span>
                        <span className="text-foreground font-semibold">
                          {whois.updatedDate ? format(new Date(whois.updatedDate), "dd/MM/yyyy HH:mm") : "Không rõ"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ngày hết hạn</span>
                        <span className="text-foreground font-semibold">
                          {whois.expiryDate ? format(new Date(whois.expiryDate), "dd/MM/yyyy HH:mm") : "Không rõ"}
                        </span>
                      </div>
                    </div>
                  </Card>
                )}
                {ssl && (
                  <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:shield-check-line-duotone" className="text-base text-emerald-500" />
                        <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Chứng chỉ SSL (HTTPS)</h3>
                      </div>
                      {ssl.valid ? (
                        <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">
                          SSL Bảo mật
                        </Badge>
                      ) : (
                        <Badge variant="danger" className="text-[10px] px-2 py-0.5 font-bold">
                          Không an toàn / Chưa cài
                        </Badge>
                      )}
                    </div>

                    {ssl.error ? (
                      <div className="p-3.5 rounded-lg bg-red-500/5 border border-red-500/20 text-xs flex gap-2.5 items-start">
                        <Icon icon="solar:danger-triangle-line-duotone" className="size-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground">Không thể thiết lập kết nối SSL an toàn</span>
                          <span className="text-muted-foreground text-[11px]">{ssl.error}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổ chức cấp phát (Issuer)</span>
                            <span className="text-foreground font-semibold truncate" title={ssl.issuer}>{ssl.issuer}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tên miền chứng chỉ (Subject CN)</span>
                            <span className="text-foreground font-semibold truncate" title={ssl.subject}>{ssl.subject}</span>
                          </div>
                        </div>

                        {ssl.validTo && (
                          <div className="flex flex-col gap-2 border-t border-border/40 pt-3">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Hiệu lực chứng chỉ</span>
                              <span className={cn("font-bold", ssl.daysRemaining <= 15 ? "text-amber-500" : "text-foreground")}>
                                {ssl.daysRemaining <= 0 ? "Đã hết hạn" : `Còn hạn ${ssl.daysRemaining} ngày`}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                              <div>
                                <span className="text-muted-foreground">Bắt đầu: </span>
                                <span className="font-medium">{format(new Date(ssl.validFrom), "dd/MM/yyyy HH:mm")}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Kết thúc: </span>
                                <span className="font-medium">{format(new Date(ssl.validTo), "dd/MM/yyyy HH:mm")}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )}
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                    <Icon icon="solar:server-square-line-duotone" className="text-base text-vanixjnk" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thông tin bản ghi DNS</h3>
                  </div>

                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Bản ghi A (IPv4)</span>
                      {dns?.A && dns.A.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dns.A.map((ip, idx) => (
                            <Badge key={idx} variant="secondary" className="font-mono text-[11px] px-2 py-0.5 bg-background/50 hover:bg-background/80 flex items-center gap-1.5 border border-border">
                              {ip}
                              <button onClick={() => copyToClipboard(ip, "Đã sao chép địa chỉ IP")} className="hover:text-foreground">
                                <Icon icon="solar:copy-line-duotone" className="size-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground text-[11px]">Không tìm thấy bản ghi A</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-border/40 pt-3">
                      <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Bản ghi AAAA (IPv6)</span>
                      {dns?.AAAA && dns.AAAA.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dns.AAAA.map((ip, idx) => (
                            <Badge key={idx} variant="secondary" className="font-mono text-[11px] px-2 py-0.5 bg-background/50 hover:bg-background/80 flex items-center gap-1.5 border border-border">
                              {ip}
                              <button onClick={() => copyToClipboard(ip, "Đã sao chép địa chỉ IP v6")} className="hover:text-foreground">
                                <Icon icon="solar:copy-line-duotone" className="size-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground text-[11px]">Không tìm thấy bản ghi AAAA</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-border/40 pt-3">
                      <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Bản ghi MX (Mail Servers)</span>
                      {dns?.MX && dns.MX.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] bg-background/30 p-2.5 rounded-lg border border-border">
                          {dns.MX.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="text-foreground">{item.exchange}</span>
                              <span className="text-muted-foreground text-[10px]">Độ ưu tiên: {item.priority}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground text-[11px]">Không tìm thấy bản ghi MX</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 border-t border-border/40 pt-3">
                      <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">Bản ghi NS (Name Servers)</span>
                      {dns?.NS && dns.NS.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {dns.NS.map((nsName, idx) => (
                            <Badge key={idx} variant="secondary" className="font-mono text-[11px] px-2 py-0.5 bg-background/50 hover:bg-background/80 border border-border">
                              {nsName}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-muted-foreground text-[11px]">Không tìm thấy bản ghi NS</span>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6">
                {http && (
                  <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                      <Icon icon="solar:bolt-line-duotone" className="text-base text-amber-500" />
                      <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Hiệu năng & Web Server</h3>
                    </div>
                    
                    <div className="flex flex-col gap-3.5 mt-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Trạng thái HTTP</span>
                        {http.status > 0 ? (
                          <Badge 
                            variant={http.status >= 200 && http.status < 300 ? "success" : http.status >= 300 && http.status < 400 ? "secondary" : "danger"} 
                            className="text-[10px] px-2 py-0.5 font-mono font-bold"
                          >
                            {http.status}
                          </Badge>
                        ) : (
                          <Badge variant="danger" className="text-[10px] px-2 py-0.5 font-mono font-bold">
                            Offline
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Độ trễ phản hồi</span>
                        <span className={cn(
                          "font-mono font-bold",
                          http.responseTimeMs < 200 
                            ? "text-green-500" 
                            : http.responseTimeMs < 800 
                            ? "text-amber-500" 
                            : "text-red-500"
                        )}>
                          {http.responseTimeMs} ms
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Web Server Signature</span>
                        <span className="font-semibold text-foreground max-w-[150px] truncate" title={http.server}>
                          {http.server}
                        </span>
                      </div>

                      {http.xPoweredBy && (
                        <div className="flex items-center justify-between border-t border-border/20 pt-2">
                          <span className="text-muted-foreground font-medium">Công nghệ (X-Powered-By)</span>
                          <span className="font-semibold text-foreground truncate">{http.xPoweredBy}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
                {geo && (
                  <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                      <Icon icon="solar:map-point-line-duotone" className="text-base text-indigo-500" />
                      <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Vị trí máy chủ IP</h3>
                    </div>

                    <div className="flex flex-col gap-3 mt-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Quốc gia</span>
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          {geo.countryCode && (
                            <img 
                              src={`https://flagcdn.com/16x12/${geo.countryCode.toLowerCase()}.png`} 
                              alt={geo.country}
                              className="size-3.5 object-cover rounded-sm border border-border"
                            />
                          )}
                          {geo.country}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Khu vực / Thành phố</span>
                        <span className="font-semibold text-foreground">
                          {geo.city ? `${geo.city}, ${geo.region}` : geo.region || "Không rõ"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-border/20 pt-2.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nhà cung cấp hạ tầng (ISP)</span>
                        <span className="font-bold text-foreground leading-normal" title={geo.isp}>
                          {geo.isp}
                        </span>
                        {geo.org && geo.org !== geo.isp && (
                          <span className="text-[10px] text-muted-foreground font-medium truncate">{geo.org}</span>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
                {whois && !whois.available && (
                  <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                      <Icon icon="solar:user-rounded-line-duotone" className="text-base text-violet-500" />
                      <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Thông tin liên hệ chủ sở hữu</h3>
                    </div>

                    {!hasRegistrantData ? (
                      <div className="text-center py-4 text-muted-foreground text-[11px] leading-relaxed flex flex-col items-center gap-2">
                        <Icon icon="solar:shield-warning-line-duotone" className="size-8 text-muted-foreground/75" />
                        <span>Thông tin đăng ký được ẩn danh vì lý do bảo mật (GDPR Protected / Private WHOIS).</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 mt-1 text-xs">
                        {whois.registrantName && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tên người đăng ký</span>
                            <span className="font-bold text-foreground">{whois.registrantName}</span>
                          </div>
                        )}
                        
                        {whois.registrantOrganization && (
                          <div className="flex flex-col gap-0.5 border-t border-border/20 pt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổ chức sở hữu</span>
                            <span className="font-bold text-foreground">{whois.registrantOrganization}</span>
                          </div>
                        )}

                        {whois.registrantEmail && (
                          <div className="flex flex-col gap-0.5 border-t border-border/20 pt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email liên hệ</span>
                            <span className="font-mono text-foreground font-semibold break-all">{whois.registrantEmail}</span>
                          </div>
                        )}

                        {whois.registrantPhone && (
                          <div className="flex flex-col gap-0.5 border-t border-border/20 pt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Số điện thoại</span>
                            <span className="font-mono text-foreground font-semibold">{whois.registrantPhone}</span>
                          </div>
                        )}

                        {whois.registrantCountry && (
                          <div className="flex flex-col gap-0.5 border-t border-border/20 pt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quốc gia chủ sở hữu</span>
                            <span className="font-bold text-foreground">{whois.registrantCountry}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                )}
                {whois && !whois.available && whois.nameServers && whois.nameServers.length > 0 && (
                  <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-border/50">
                      <Icon icon="solar:route-line-duotone" className="text-base text-vanixjnk" />
                      <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Name Servers (Whois)</h3>
                    </div>
                    <div className="flex flex-col gap-2 mt-1">
                      {whois.nameServers.map((ns, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border text-[11px] font-mono break-all text-foreground">
                          <Icon icon="solar:server-path-line-duotone" className="size-3.5 text-vanixjnk shrink-0" />
                          <span>{ns}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
