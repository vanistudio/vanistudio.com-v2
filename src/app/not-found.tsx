"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  const [pathname, setPathname] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
      setUserAgent(window.navigator.userAgent);
      setTime(new Date().toISOString());
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-sans select-none relative overflow-x-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-20" />
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-red-500 bg-red-500/10 border border-red-500/25 shrink-0">
                <Icon icon="solar:danger-triangle-line-duotone" className="text-2xl animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Không Tìm Thấy Trang</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Đường dẫn bạn đang truy cập không khả dụng hoặc đã di chuyển sang vị trí khác.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/80 bg-muted/30 px-3 py-1.5 rounded border border-border">
              <span className="size-2 rounded-full bg-red-500 animate-ping" />
              <span>ERR_CONNECTION_REFUSED_404</span>
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
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col relative">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/5 flex-1 flex flex-col">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 flex-1">
            
            <div className="lg:col-span-1 border-r border-b lg:border-b-0 border-dashed border-primary/20 p-6 flex flex-col gap-6 bg-muted/10">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                  [01] Route Metadata
                </span>
                <p className="text-xs text-muted-foreground">Thông số hệ thống ghi nhận từ yêu cầu của trình duyệt.</p>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-lg border bg-background/50 space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Request URI:</span>
                    <span className="text-foreground font-semibold truncate max-w-[140px] text-right" title={pathname}>
                      {pathname || "/..."}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="text-vanixjnk font-semibold">GET</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">HTTP Version:</span>
                    <span className="text-foreground">HTTP/3 (QUIC)</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">Protocol:</span>
                    <span className="text-green-500 font-semibold">HTTPS</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-1.5">
                    <span className="text-muted-foreground">SSL Cipher:</span>
                    <span className="text-foreground text-[9px] truncate max-w-[120px]" title="TLS_AES_256_GCM_SHA384">
                      AES_256_GCM
                    </span>
                  </div>
                  <div className="flex justify-between pb-0">
                    <span className="text-muted-foreground">Host:</span>
                    <span className="text-foreground">vanistudio.com</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-background/50 space-y-2 font-mono text-[10px]">
                  <div className="flex flex-col gap-1 border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Client Agent:</span>
                    <span className="text-foreground leading-normal line-clamp-2 text-left" title={userAgent}>
                      {userAgent || "Unknown Browser Agent"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="text-foreground truncate max-w-[150px]" title={time}>
                      {time ? time.split("T")[0] + " " + time.split("T")[1].slice(0, 8) : "--:--:--"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-dashed border-primary/10">
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500/90 text-xs">
                  <Icon icon="solar:shield-warning-line-duotone" className="text-lg shrink-0" />
                  <span className="font-semibold leading-normal">Đường dẫn không khớp với bất kỳ tệp tĩnh hay động nào trong cấu hình.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-center items-center gap-8 min-h-[500px] relative">
              <div className="absolute inset-y-0 left-0 border-l border-dashed border-primary/20 pointer-events-none hidden lg:block" />

              <div className="w-full max-w-3xl border border-border/80 rounded-xl overflow-hidden bg-background shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/40 select-none shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => router.push("/")}
                        className="size-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors focus:outline-none"
                        title="Về Trang Chủ"
                      />
                      <div className="size-3 rounded-full bg-yellow-500/80" />
                      <div className="size-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground ml-3 bg-muted/80 px-3 py-1 rounded border border-border/80 flex items-center gap-1">
                      <Icon icon="solar:code-line-duotone" />
                      <span>vani-shell --error-handler</span>
                    </span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    STATUS_404
                  </span>
                </div>

                <div className="p-6 font-mono text-xs text-muted-foreground bg-black/5 dark:bg-black/40 space-y-6 overflow-x-auto min-h-[300px]">
                  
                  <div className="flex flex-col gap-1.5 border-b border-border/40 pb-5">
                    <div className="text-red-500 font-extrabold text-sm sm:text-base tracking-widest flex items-center gap-2">
                      <Icon icon="solar:danger-line-duotone" className="text-xl" />
                      <span>[CRITICAL] RUNTIME_EXCEPTION: PAGE_NOT_FOUND</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Module: router_resolver.go | Line: 404 | Severity: HIGH
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-vanixjnk shrink-0">$</span>
                      <span className="text-foreground">resolver --lookup {pathname || "/requested-page"}</span>
                    </div>
                    <div className="pl-4 space-y-1 text-muted-foreground">
                      <p className="text-yellow-500/95 flex items-center gap-1.5">
                        <Icon icon="solar:danger-line-duotone" className="text-sm shrink-0" />
                        <span>Warning: Request matching fell through main router groups.</span>
                      </p>
                      <p className="flex items-center gap-1.5 pl-5">
                        <span className="text-primary/40">↳</span>
                        <span>Step 1: Checking static route dictionary... [FAIL]</span>
                      </p>
                      <p className="flex items-center gap-1.5 pl-5">
                        <span className="text-primary/40">↳</span>
                        <span>Step 2: Querying dynamic page database (CMS slugs)... [FAIL]</span>
                      </p>
                      <p className="flex items-center gap-1.5 pl-5">
                        <span className="text-primary/40">↳</span>
                        <span>Step 3: Resolving tool routes cache... [FAIL]</span>
                      </p>
                      <p className="text-red-500/90 font-semibold flex items-center gap-1.5">
                        <Icon icon="solar:close-circle-line-duotone" className="text-sm shrink-0" />
                        <span>Result: 404 Not Found. Unable to render page.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="font-bold text-xs gap-1.5 h-9"
                >
                  <Icon icon="solar:arrow-left-line-duotone" className="text-base" />
                  <span>Trở Lại</span>
                </Button>
                <Button
                  variant="vanixjnk"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="font-bold text-xs gap-1.5 h-9"
                >
                  <Icon icon="solar:home-2-line-duotone" className="text-base" />
                  <span>Về Trang Chủ</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full border-t border-dashed border-primary/20 bg-muted/20 select-none">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 py-2.5 px-6 flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SERVER_STATUS: ONLINE</span>
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">NODE_ENV: DEVELOPMENT</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">BUILD: NEXT_APP_V2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
