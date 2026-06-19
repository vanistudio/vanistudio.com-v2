"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

interface CookieResult {
  cookie: string;
  status: "live" | "dead";
  id?: string;
  name?: string;
  avatar?: string;
  error?: string;
}

export default function PubCheckCookie() {
  const [cookieInput, setCookieInput] = useState("");
  const [results, setResults] = useState<CookieResult[]>([]);
  const [checking, setChecking] = useState(false);

  const checkCookieMutation = trpc.tools.checkFacebookCookieLive.useMutation();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cookies = cookieInput
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (cookies.length === 0) {
      toast.warning("Vui lòng nhập ít nhất một Cookie Facebook.");
      return;
    }

    if (cookies.length > 20) {
      toast.warning("Chỉ hỗ trợ kiểm tra tối đa 20 Cookie cùng lúc.");
    }

    const limitedCookies = cookies.slice(0, 20);
    setChecking(true);
    setResults([]);

    const tempResults: CookieResult[] = [];

    for (const cookie of limitedCookies) {
      try {
        const res = await checkCookieMutation.mutateAsync({ cookie });
        tempResults.push({
          cookie,
          status: res.status,
          id: res.id,
          name: res.name,
          avatar: res.avatar,
          error: res.error,
        });
      } catch (err: any) {
        tempResults.push({
          cookie,
          status: "dead",
          error: err.message || "Lỗi kết nối",
        });
      }
    }

    setResults(tempResults);
    setChecking(false);

    const liveCount = tempResults.filter(r => r.status === "live").length;
    toast.success(`Đã kiểm tra xong ${tempResults.length} Cookie. Live: ${liveCount}, Die: ${tempResults.length - liveCount}`);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const total = results.length;
  const liveCount = results.filter(r => r.status === "live").length;
  const dieCount = total - liveCount;

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:donut-bitten-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Kiểm Tra Cookie Facebook</h1>
              <p className="text-sm text-muted-foreground">
                Phân tích nhanh trạng thái hoạt động (Live/Die) của Cookie Facebook và lấy thông tin ID, Tên, Ảnh đại diện.
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
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-foreground">Nhập Cookie Facebook</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Nhập danh sách Cookie cần kiểm tra, mỗi dòng một Cookie. Hỗ trợ tối đa 20 Cookie.
                  </p>
                </div>

                <form onSubmit={handleCheck} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cookies" className="text-xs font-bold text-foreground">
                      Danh sách Cookie
                    </Label>
                    <Textarea
                      id="cookies"
                      rows={10}
                      value={cookieInput}
                      onChange={(e) => setCookieInput(e.target.value)}
                      placeholder="Ví dụ: c_user=1000...; xs=...;"
                      className="text-xs font-mono resize-y min-h-[200px]"
                      disabled={checking}
                    />
                  </div>

                  <div className="flex gap-2 justify-end items-center border-t border-border/40 pt-4">
                    {cookieInput && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCookieInput("");
                          setResults([]);
                        }}
                        disabled={checking}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Xóa
                      </Button>
                    )}

                    <Button
                      type="submit"
                      variant="vanixjnk"
                      size="sm"
                      disabled={checking}
                      className="font-bold text-xs px-4"
                    >
                      {checking ? (
                        <>
                          <Icon icon="solar:spinner-line-duotone" className="size-4 animate-spin" />
                          <span>Đang kiểm tra...</span>
                        </>
                      ) : (
                        <>
                          <Icon icon="solar:play-line-duotone" className="size-4" />
                          <span>Bắt đầu</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-6">
              {total > 0 && (
                <Card className="p-5 bg-card/30 border-border grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col gap-0.5 border-r border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng kiểm tra</span>
                    <span className="text-lg font-black text-foreground">{total}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 border-r border-border/50">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Hoạt động (Live)</span>
                    <span className="text-lg font-black text-emerald-500">{liveCount}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Bị chặn/Hỏng (Die)</span>
                    <span className="text-lg font-black text-red-500">{dieCount}</span>
                  </div>
                </Card>
              )}
              {results.length > 0 ? (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Kết quả chi tiết</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          const liveUids = results.filter(r => r.status === "live" && r.id).map(r => r.id).join("\n");
                          copyToClipboard(liveUids, "Đã sao chép danh sách UID Live");
                        }}
                        className="text-[10px] font-bold"
                      >
                        Sao chép UID
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          const resultsText = results.map(r => {
                            if (r.status === "live") {
                              return `${r.id} | ${r.name} | LIVE`;
                            } else {
                              return `DIE | ${r.error || "Cookie không hợp lệ"}`;
                            }
                          }).join("\n");
                          copyToClipboard(resultsText, "Đã sao chép toàn bộ kết quả");
                        }}
                        className="text-[10px] font-bold"
                      >
                        Sao chép tất cả
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-[450px] overflow-y-auto pr-1.5 scrollbar-thin">
                    {results.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/60 hover:bg-background/50 hover:border-border transition-colors gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative size-9 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                            {item.status === "live" && item.avatar ? (
                              <img
                                src={item.avatar}
                                alt={item.name || "FB User"}
                                className="size-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/c8/21/57/c821574f-4153-3432-693a-49f96d51d2d1/AppIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/400x400ia-75.webp";
                                }}
                              />
                            ) : (
                              <div className="size-full flex items-center justify-center bg-muted text-muted-foreground">
                                <Icon icon="solar:user-line-duotone" className="size-5" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            {item.status === "live" ? (
                              <>
                                <span className="text-xs font-bold text-foreground truncate">{item.name || "Unknown"}</span>
                                <span className="font-mono text-[10px] text-muted-foreground truncate">{item.id}</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-semibold text-red-500 truncate">Die / Không hoạt động</span>
                                <span className="font-mono text-[9px] text-muted-foreground truncate max-w-[200px]" title={item.cookie}>
                                  {item.cookie.slice(0, 30)}...
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === "live" && item.id && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(item.id!, "Đã sao chép UID")}
                                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                title="Sao chép UID"
                              >
                                <Icon icon="solar:copy-line-duotone" className="size-3.5" />
                              </Button>
                              <a
                                href={`https://facebook.com/${item.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-vanixjnk hover:bg-muted/60"
                                title="Xem trang cá nhân"
                              >
                                <Icon icon="solar:arrow-right-up-linear" className="size-3.5" />
                              </a>
                            </>
                          )}

                          {item.status === "live" ? (
                            <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold uppercase">
                              Live
                            </Badge>
                          ) : (
                            <Badge variant="danger" className="text-[10px] px-2 py-0.5 font-bold uppercase">
                              Die
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border rounded-xl bg-card/10 text-center gap-2.5">
                  <Icon icon="solar:checklist-line-duotone" className="size-10 text-muted-foreground/60" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-xs text-foreground">Chưa có kết quả kiểm tra</span>
                    <span className="text-[11px] text-muted-foreground">Nhập danh sách Cookie bên trái và ấn nút để bắt đầu kiểm tra.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
