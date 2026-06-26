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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DiscordResult {
  token: string;
  status: "live" | "dead";
  data?: any;
  error?: string;
}

const DISCORD_BADGE_ICONS: Record<string, string> = {
  "Discord Staff": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordstaff.svg",
  "Discord Partner": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordpartner.svg",
  "HypeSquad Events": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadevents.svg",
  "Bug Hunter Level 1": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbughunter1.svg",
  "HypeSquad Bravery": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbravery.svg",
  "HypeSquad Brilliance": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbrilliance.svg",
  "HypeSquad Balance": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/hypesquadbalance.svg",
  "Early Supporter": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordearlysupporter.svg",
  "Bug Hunter Level 2": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbughunter2.svg",
  "Verified Developer": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordbotdev.svg",
  "Certified Moderator Alumni": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordmod.svg",
  "Bot HTTP Interactions": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/supportscommands.svg",
  "Active Developer": "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/activedeveloper.svg",
};

const getCreationDate = (id: string): string => {
  try {
    const idBig = BigInt(id);
    const timestamp = Number((idBig / BigInt(4194304)) + BigInt(1420070400000));
    return new Date(timestamp).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Không rõ";
  }
};


export default function PubCheckDiscord() {
  const [tokenInput, setTokenInput] = useState("");
  const [results, setResults] = useState<DiscordResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [selectedResult, setSelectedResult] = useState<DiscordResult | null>(null);

  const checkDiscordTokenMutation = trpc.tools.checkDiscordToken.useMutation();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokens = tokenInput
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      toast.warning("Vui lòng nhập ít nhất một Token Discord.");
      return;
    }

    if (tokens.length > 20) {
      toast.warning("Chỉ hỗ trợ kiểm tra tối đa 20 Token cùng lúc.");
    }

    const limitedTokens = tokens.slice(0, 20);
    setChecking(true);
    setResults([]);

    const tempResults: DiscordResult[] = await Promise.all(
      limitedTokens.map(async (token) => {
        try {
          const res = await checkDiscordTokenMutation.mutateAsync({ token });
          return {
            token,
            status: "live",
            data: res,
          };
        } catch (err: any) {
          return {
            token,
            status: "dead",
            error: err.message || "Token không hợp lệ hoặc hết hạn",
          };
        }
      })
    );

    setResults(tempResults);
    setChecking(false);

    const liveCount = tempResults.filter((r) => r.status === "live").length;
    toast.success(
      `Đã kiểm tra xong ${tempResults.length} Token. Live: ${liveCount}, Die: ${
        tempResults.length - liveCount
      }`
    );
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const total = results.length;
  const liveCount = results.filter((r) => r.status === "live").length;
  const dieCount = total - liveCount;

  const getAccentColorStyle = (accentColor: number | null) => {
    if (!accentColor) return {};
    const hex = accentColor.toString(16).padStart(6, "0");
    return { backgroundColor: `#${hex}` };
  };

  const getConnectionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "github":
        return "bxl:github";
      case "youtube":
        return "bxl:youtube";
      case "steam":
        return "bxl:steam";
      case "twitch":
        return "bxl:twitch";
      case "spotify":
        return "bxl:spotify";
      case "twitter":
        return "bxl:twitter";
      case "facebook":
        return "bxl:facebook";
      case "reddit":
        return "bxl:reddit";
      case "xbox":
        return "bxl:xbox";
      case "playstation":
        return "bxl:playstation";
      default:
        return "solar:link-line-duotone";
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[100px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="ic:baseline-discord" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Kiểm Tra Token Discord</h1>
              <p className="text-sm text-muted-foreground">
                Kiểm tra chi tiết trạng thái hoạt động (Live/Die) của tài khoản/bot Discord, thông tin Nitro, liên kết thanh toán, máy chủ quản trị và nhiều thông tin khác.
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
                  <h3 className="font-bold text-sm text-foreground">Nhập Token Discord</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Hỗ trợ cả token User (MFA, self) và token Bot. Mỗi dòng nhập một token, tối đa 20 token.
                  </p>
                </div>

                <form onSubmit={handleCheck} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tokens" className="text-xs font-bold text-foreground">
                      Danh sách Token
                    </Label>
                    <Textarea
                      id="tokens"
                      rows={10}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Ví dụ: MTEx... (User token) hoặc Bot MTAy... (Bot token)"
                      className="text-xs font-mono resize-y min-h-[200px]"
                      disabled={checking}
                    />
                  </div>

                  <div className="flex gap-2 justify-end items-center border-t border-border/40 pt-4">
                    {tokenInput && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTokenInput("");
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
                          const liveTokens = results.filter((r) => r.status === "live").map((r) => r.token).join("\n");
                          copyToClipboard(liveTokens, "Đã sao chép danh sách Token Live");
                        }}
                        className="text-[10px] font-bold"
                      >
                        Sao chép Token Live
                      </Button>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          const resultsText = results
                            .map((r) => {
                              if (r.status === "live") {
                                const info = r.data;
                                const isBotStr = info.bot ? "BOT" : "USER";
                                return `${r.token} | ${info.globalName || info.username} | LIVE | ${isBotStr}`;
                              } else {
                                return `${r.token} | DIE | ${r.error || "Token không hợp lệ"}`;
                              }
                            })
                            .join("\n");
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
                        onClick={() => item.status === "live" && setSelectedResult(item)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/60 hover:bg-background/50 hover:border-border transition-colors gap-4",
                          item.status === "live" ? "cursor-pointer" : ""
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative size-9 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                            {item.status === "live" && item.data?.avatarUrl ? (
                              <img
                                src={item.data.avatarUrl}
                                alt={item.data.username || "Discord User"}
                                className="size-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://cdn.discordapp.com/embed/avatars/0.png";
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
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-xs font-bold text-foreground truncate">
                                    {item.data.globalName || item.data.username}
                                  </span>
                                  {item.data.bot ? (
                                    <Badge variant="outline" className="text-[8px] font-black tracking-wide uppercase px-1 py-0 rounded h-3 bg-vanixjnk/15 text-vanixjnk border-vanixjnk/25 hover:bg-vanixjnk/15">
                                      Bot
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[8px] font-bold uppercase px-1 py-0 rounded h-3">
                                      User
                                    </Badge>
                                  )}
                                  {item.data.nitroType && item.data.nitroType !== "None" && (
                                    <Badge className="text-[8px] bg-pink-500/10 text-pink-500 border-pink-500/20 font-bold uppercase px-1 py-0 rounded h-3">
                                      Nitro
                                    </Badge>
                                  )}
                                </div>
                                <span className="font-mono text-[10px] text-muted-foreground truncate">
                                  @{item.data.username} ({item.data.id})
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-xs font-semibold text-red-500 truncate">
                                  Die / Không hoạt động
                                </span>
                                <span className="font-mono text-[9px] text-muted-foreground truncate max-w-[200px]" title={item.token}>
                                  {item.token.slice(0, 30)}...
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {item.status === "live" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(item.token, "Đã sao chép Token");
                                }}
                                className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                title="Sao chép Token"
                              >
                                <Icon icon="solar:copy-line-duotone" className="size-3.5" />
                              </Button>
                              <span className="text-[10px] font-bold text-vanixjnk group-hover:underline flex items-center gap-0.5">
                                Chi tiết
                                <Icon icon="solar:alt-arrow-right-line-duotone" className="size-3" />
                              </span>
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
                    <span className="text-[11px] text-muted-foreground">Nhập danh sách Token bên trái và ấn nút để bắt đầu kiểm tra.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[85vh] flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="size-8 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0">
                <Icon icon="ic:baseline-discord" className="size-5" />
              </div>
              Chi tiết tài khoản Discord
            </DialogTitle>
            <DialogDescription className="text-left mt-1 text-[13px]">
              Thông tin chi tiết về profile, Nitro, cấu hình thanh toán và danh sách server.
            </DialogDescription>
          </DialogHeader>
          {selectedResult?.data && (
            <div className="flex-1 overflow-y-auto px-2 space-y-5 custom-scrollbar max-h-[55vh]">
              <div className="rounded-xl overflow-hidden border border-border bg-card/60 relative shrink-0">
                {selectedResult.data.bannerUrl ? (
                  <div className="w-full relative aspect-[3/1] overflow-hidden bg-muted">
                    <img
                      src={selectedResult.data.bannerUrl}
                      alt="Banner"
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "w-full aspect-[3/1] relative bg-cover bg-center",
                      !selectedResult.data.accentColor ? "bg-primary/20" : ""
                    )}
                    style={getAccentColorStyle(selectedResult.data.accentColor)}
                  />
                )}

                <div className="px-4 relative z-10 -mt-10">
                  <div className="relative size-20 rounded-full border-4 border-card bg-muted shrink-0 shadow-md overflow-hidden">
                    <img
                      src={selectedResult.data.avatarUrl}
                      alt={selectedResult.data.username}
                      className="size-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://cdn.discordapp.com/embed/avatars/0.png";
                      }}
                    />
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground truncate">
                          {selectedResult.data.globalName || selectedResult.data.username}
                        </h3>
                        {selectedResult.data.bot ? (
                          <Badge variant="outline" className="text-[8px] font-black px-1.5 py-0 bg-vanixjnk/15 text-vanixjnk border-vanixjnk/25">
                            Bot
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[8px] font-bold px-1.5 py-0">
                            User
                          </Badge>
                        )}
                        {selectedResult.data.mfaEnabled && (
                          <Badge className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold px-1 py-0 flex items-center gap-0.5">
                            <Icon icon="solar:shield-keyhole-line-duotone" className="size-2.5" />
                            2FA
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">
                        @{selectedResult.data.username} <span className="text-[8px] opacity-60">({selectedResult.data.id})</span>
                      </p>
                    </div>

                    {(selectedResult.data.badges?.length > 0 || (selectedResult.data.nitroType && selectedResult.data.nitroType !== "None")) && (
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 bg-background/30 p-1.5 rounded-lg border border-border/40">
                        {selectedResult.data.nitroType && selectedResult.data.nitroType !== "None" && (
                          <div title={`Discord Nitro (${selectedResult.data.nitroType})`}>
                            <img
                              src="https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/discordnitro.svg"
                              alt="Discord Nitro"
                              className="size-5 object-contain"
                            />
                          </div>
                        )}
                        {selectedResult.data.badges?.map((badge: string, i: number) => {
                          const iconUrl = DISCORD_BADGE_ICONS[badge];
                          if (iconUrl) {
                            return (
                              <div key={i} title={badge}>
                                <img
                                  src={iconUrl}
                                  alt={badge}
                                  className="size-5 object-contain"
                                />
                              </div>
                            );
                          }
                          return (
                            <Badge key={i} variant="outline" className="text-[9px] font-semibold py-0.5 px-1.5 border-none text-foreground/80 bg-transparent hover:bg-transparent">
                              {badge}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

                {selectedResult.data.bio && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tiểu sử / Giới thiệu</span>
                    <p className="text-xs text-foreground/80 bg-background/25 p-3 rounded-lg border border-border/40 whitespace-pre-wrap leading-relaxed">
                      {selectedResult.data.bio}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-4 bg-background/20 border-border/50 flex flex-col gap-2.5">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Icon icon="solar:user-line-duotone" />
                      Thông tin cơ bản
                    </span>
                    <div className="text-xs flex flex-col gap-1.5">
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-semibold text-foreground">{selectedResult.data.email || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Số điện thoại:</span>
                        <span className="font-semibold text-foreground">{selectedResult.data.phone || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Ngày tạo:</span>
                        <span className="font-semibold text-foreground">{getCreationDate(selectedResult.data.id)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Xác thực 2 lớp (MFA):</span>
                        <span className="font-semibold text-foreground">{selectedResult.data.mfaEnabled ? "Đã bật" : "Chưa bật"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Cho phép NSFW:</span>
                        <span className="font-semibold text-foreground">{selectedResult.data.nsfwAllowed ? "Có" : "Không"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Ngôn ngữ:</span>
                        <span className="font-semibold text-foreground">{selectedResult.data.locale || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Xác minh email:</span>
                        <span className="font-bold text-foreground">
                          {selectedResult.data.verified ? (
                            <span className="text-emerald-500">Đã xác minh</span>
                          ) : (
                            <span className="text-amber-500">Chưa xác minh</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {selectedResult.data.settings && (
                    <Card className="p-4 bg-background/20 border-border/50 flex flex-col gap-2.5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Icon icon="solar:settings-line-duotone" />
                        Thiết lập & Trạng thái
                      </span>
                      <div className="text-xs flex flex-col gap-1.5">
                        <div className="flex justify-between py-1 border-b border-border/10">
                          <span className="text-muted-foreground">Giao diện (Theme):</span>
                          <span className="font-semibold text-foreground capitalize">
                            {selectedResult.data.settings.theme}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/10">
                          <span className="text-muted-foreground">Developer Mode:</span>
                          <span className="font-semibold text-foreground">
                            {selectedResult.data.settings.developerMode ? "Bật" : "Tắt"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-border/10">
                          <span className="text-muted-foreground">Trạng thái:</span>
                          <span className="font-bold text-foreground capitalize flex items-center gap-1">
                            {selectedResult.data.settings.status === "online" && (
                              <>
                                <span className="size-2 rounded-full bg-emerald-500" />
                                <span>Trực tuyến</span>
                              </>
                            )}
                            {selectedResult.data.settings.status === "idle" && (
                              <>
                                <span className="size-2 rounded-full bg-amber-500" />
                                <span>Chờ</span>
                              </>
                            )}
                            {selectedResult.data.settings.status === "dnd" && (
                              <>
                                <span className="size-2 rounded-full bg-red-500" />
                                <span>Không làm phiền</span>
                              </>
                            )}
                            {selectedResult.data.settings.status === "offline" && (
                              <>
                                <span className="size-2 rounded-full bg-gray-500" />
                                <span>Ngoại tuyến</span>
                              </>
                            )}
                          </span>
                        </div>
                        {selectedResult.data.settings.customStatus && (
                          <div className="flex justify-between py-1 border-b border-border/10">
                            <span className="text-muted-foreground">Trạng thái tùy chỉnh:</span>
                            <span className="font-medium text-foreground truncate max-w-[150px]" title={selectedResult.data.settings.customStatus.text}>
                              {selectedResult.data.settings.customStatus.emoji && (
                                <span className="mr-1">{selectedResult.data.settings.customStatus.emoji}</span>
                              )}
                              {selectedResult.data.settings.customStatus.text || ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>

                {(selectedResult.data.nitroType !== "None" || selectedResult.data.billing) && (
                  <Card className="p-4 bg-background/20 border-border/50 flex flex-col gap-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Icon icon="solar:card-recieved-line-duotone" />
                      Gói dịch vụ & Thanh toán
                    </span>
                    <div className="text-xs flex flex-col gap-2">
                      <div className="flex justify-between items-center py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Đăng ký Nitro:</span>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-bold",
                              selectedResult.data.nitroType === "None"
                                ? "border-border text-foreground"
                                : "bg-vanixjnk/15 text-vanixjnk border-vanixjnk/25 hover:bg-vanixjnk/15"
                            )}
                          >
                            {selectedResult.data.nitroType}
                          </Badge>
                          {selectedResult.data.nitroExpiry && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              (Hạn: {new Date(selectedResult.data.nitroExpiry).toLocaleDateString("vi-VN")})
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedResult.data.billing && (
                        <div className="flex flex-col gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-muted-foreground">Phương thức thanh toán liên kết</span>
                          {selectedResult.data.billing.sources?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                              {selectedResult.data.billing.sources.map((src: any) => (
                                <div key={src.id} className="p-2.5 rounded-lg border border-border bg-background/30 flex items-center justify-between gap-3 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Icon
                                      icon={
                                        src.typeName.toLowerCase().includes("card")
                                          ? "solar:card-line-duotone"
                                          : "bxl:paypal"
                                      }
                                      className={cn("size-5", src.typeName.toLowerCase().includes("card") ? "text-blue-500" : "text-sky-600")}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-semibold text-foreground">
                                        {src.brand ? `${src.brand} ****${src.last4}` : src.typeName}
                                      </span>
                                      {src.expiresMonth && src.expiresYear && (
                                        <span className="text-[9px] text-muted-foreground">
                                          Hạn: {src.expiresMonth}/{src.expiresYear}
                                        </span>
                                      )}
                                      {src.email && (
                                        <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{src.email}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    {src.default && (
                                      <Badge className="text-[8px] font-extrabold bg-vanixjnk/15 text-vanixjnk border-vanixjnk/25 px-1 py-0 h-3.5">
                                        Mặc định
                                      </Badge>
                                    )}
                                    {src.invalid && (
                                      <Badge variant="danger" className="text-[8px] font-bold px-1 py-0 h-3.5">
                                        Lỗi
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-[11px] italic">Không liên kết phương thức thanh toán nào.</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {selectedResult.data.bot && selectedResult.data.botInfo && (
                  <Card className="p-4 bg-background/20 border-border/50 flex flex-col gap-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Icon icon="solar:cpu-line-duotone" />
                      Thông tin cấu hình Bot
                    </span>
                    <div className="text-xs flex flex-col gap-2">
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Bot công khai (Public):</span>
                        <span className="font-bold text-foreground">
                          {selectedResult.data.botInfo.botPublic ? "Có (Ai cũng có thể mời)" : "Không (Chỉ chủ sở hữu)"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/10">
                        <span className="text-muted-foreground">Yêu cầu xác nhận (Code Grant):</span>
                        <span className="font-semibold text-foreground">
                          {selectedResult.data.botInfo.botRequireCodeGrant ? "Bật" : "Tắt"}
                        </span>
                      </div>
                      {selectedResult.data.botInfo.owner && (
                        <div className="flex justify-between py-1 border-b border-border/10">
                          <span className="text-muted-foreground">Nhà phát triển (Chủ sở hữu):</span>
                          <span className="font-semibold text-foreground">
                            {selectedResult.data.botInfo.owner.globalName || selectedResult.data.botInfo.owner.username}{" "}
                            <span className="font-mono text-[9px] text-muted-foreground">({selectedResult.data.botInfo.owner.id})</span>
                          </span>
                        </div>
                      )}
                      {selectedResult.data.botInfo.team && (
                        <div className="flex justify-between py-1 border-b border-border/10">
                          <span className="text-muted-foreground">Nhóm phát triển (Team):</span>
                          <span className="font-semibold text-foreground">
                            {selectedResult.data.botInfo.team.name} ({selectedResult.data.botInfo.team.membersCount} thành viên)
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {selectedResult.data.connections && selectedResult.data.connections.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Icon icon="solar:share-line-duotone" />
                      Liên kết tài khoản ({selectedResult.data.connections.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedResult.data.connections.map((conn: any, i: number) => (
                        <div key={i} className="p-2 rounded-lg border border-border/60 bg-background/20 flex items-center gap-2 text-xs">
                          <Icon icon={getConnectionIcon(conn.type)} className="size-4 shrink-0 text-foreground/80" />
                          <div className="flex flex-col min-w-0 flex-grow">
                            <span className="font-bold text-foreground truncate" title={conn.name}>
                              {conn.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground uppercase tracking-tight truncate">
                              {conn.type}
                            </span>
                          </div>
                          {conn.verified && (
                            <span title="Đã xác minh" className="shrink-0 flex items-center">
                              <Icon icon="solar:verified-check-line-duotone" className="size-3 text-sky-500" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResult.data.guilds && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Icon icon="solar:server-square-line-duotone" />
                        Danh sách máy chủ ({selectedResult.data.guilds.totalCount})
                      </span>
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        Quản trị / Sở hữu: {selectedResult.data.guilds.adminOrOwnerCount}
                      </Badge>
                    </div>

                    {selectedResult.data.guilds.list?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {selectedResult.data.guilds.list.map((guild: any) => (
                          <div key={guild.id} className="p-2 rounded-lg border border-border bg-background/20 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="size-7 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0 border border-border/60">
                                {guild.iconUrl ? (
                                  <img src={guild.iconUrl} alt={guild.name} className="size-full object-cover" />
                                ) : (
                                  <span className="font-bold text-[10px] text-muted-foreground uppercase">
                                    {guild.name.slice(0, 2)}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-foreground truncate" title={guild.name}>
                                {guild.name}
                              </span>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {guild.owner && (
                                <Badge className="text-[8px] font-extrabold bg-amber-500/10 text-amber-500 border-amber-500/20 px-1 py-0 h-4">
                                  Owner
                                </Badge>
                              )}
                              {guild.isAdmin && !guild.owner && (
                                <Badge className="text-[8px] font-extrabold bg-blue-500/10 text-blue-500 border-blue-500/20 px-1 py-0 h-4">
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px] italic">Không tham gia máy chủ nào hoặc không lấy được danh sách.</span>
                    )}
                  </div>
                )}
              </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
