"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import QRCode from "qrcode";
import Image from "next/image";

function AppStore({ className }: { className?: string }) {
  return <Icon icon="ri:apple-fill" className={className} />;
}

function GooglePlay({ className }: { className?: string }) {
  return <Icon icon="ri:google-play-fill" className={className} />;
}

interface CustomQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  logoUrl?: string;
  logoSize?: number;
  status?: string;
}

export function CustomQRCode({
  value,
  size = 200,
  color = "#000000",
  backgroundColor = "#ffffff",
  logoUrl,
  logoSize = 40,
  status = "pending"
}: CustomQRCodeProps) {
  const qrData = useMemo(() => {
    try {
      return QRCode.create(value, {
        errorCorrectionLevel: "H",
      });
    } catch (e) {
      console.error("QR Generation Error", e);
      return null;
    }
  }, [value]);

  if (!qrData) return null;

  const { modules } = qrData;
  const matrixSize = modules.size;
  const data = modules.data;
  const logoRatio = logoSize / size;
  const logoMatrixSize = Math.floor(matrixSize * logoRatio);
  const center = matrixSize / 2;
  const startExclusion = Math.floor(center - logoMatrixSize / 2);
  const endExclusion = Math.ceil(center + logoMatrixSize / 2);

  const renderModules = () => {
    const ops = [];
    for (let row = 0; row < matrixSize; row++) {
      for (let col = 0; col < matrixSize; col++) {
        if (!data[row * matrixSize + col]) continue;
        if (logoUrl) {
          if (row >= startExclusion && row < endExclusion && col >= startExclusion && col < endExclusion) {
            continue;
          }
        }

        const isFinder = (
          (row < 7 && col < 7) ||
          (row < 7 && col >= matrixSize - 7) ||
          (row >= matrixSize - 7 && col < 7)
        );

        if (isFinder) {
          ops.push(
            <rect
              key={`m-${row}-${col}`}
              x={col}
              y={row}
              width={1}
              height={1}
              fill={color}
              rx={0.25}
            />
          );
        } else {
          ops.push(
            <circle
              key={`m-${row}-${col}`}
              cx={col + 0.5}
              cy={row + 0.5}
              r={0.4}
              fill={color}
            />
          );
        }
      }
    }
    return ops;
  };

  return (
    <div
      className="relative overflow-hidden group"
      style={{
        width: size,
        height: size,
        background: backgroundColor,
        padding: size * 0.02,
        borderRadius: size * 0.08
      }}
    >
      <div className="relative z-10 w-full h-full">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${matrixSize} ${matrixSize}`}
          style={{ display: "block" }}
        >
          {renderModules()}
        </svg>
      </div>

      {logoUrl && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-md flex items-center justify-center shadow-lg border border-gray-100 z-30"
          style={{ width: logoSize + 8, height: logoSize + 8 }}
        >
          <div className="relative overflow-hidden rounded-sm" style={{ width: logoSize, height: logoSize }}>
            <Image
              src={logoUrl}
              alt="Logo"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}

const SUGGESTED_AUTH_APPS = [
  {
    name: "Google Authenticator",
    logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple116/v4/c8/21/57/c821574f-4153-3432-693a-49f96d51d2d1/AppIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/400x400ia-75.webp",
    appStoreUrl: "https://apps.apple.com/app/google-authenticator/id388497605",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2",
  },
  {
    name: "Microsoft Authenticator",
    logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e5/f9/e9/e5f9e91d-6cbd-bd40-44af-0cf8f41222af/logo_authenticator_color-0-1x_U007emarketing-0-0-0-6-0-0-0-85-220-0.png/400x400ia-75.webp",
    appStoreUrl: "https://apps.apple.com/app/microsoft-authenticator/id983156458",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.azure.authenticator",
  },
  {
    name: "Authy",
    logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/31/b7/a8/31b7a8f3-a164-d1f8-cc20-0ae39d5cef7d/AppIcon-0-1x_U007emarketing-0-11-0-sRGB-85-220-0.png/400x400ia-75.webp",
    appStoreUrl: "https://apps.apple.com/app/authy/id494168017",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.authy.authy",
  },
  {
    name: "1Password",
    logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/47/89/7c/47897c81-ab79-5430-b15a-820875290ca7/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/400x400ia-75.webp",
    appStoreUrl: "https://apps.apple.com/app/1password-password-manager/id568903335",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.agilebits.onepassword",
  },
  {
    name: "LastPass",
    logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fa/23/a4/fa23a474-c042-d18c-754c-3381ab71b72c/AppIconRelease-0-0-1x_U007epad-0-1-0-85-220.png/400x400ia-75.webp",
    appStoreUrl: "https://apps.apple.com/app/lastpass-authenticator/id1079110004",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.lastpass.authenticator",
  },
];

interface SavedKey {
  id: string;
  label: string;
  secret: string;
  issuer?: string;
  account?: string;
}

function decodeBase32(base32: string): Uint8Array {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = base32.replace(/=+$/, "").replace(/[\s-]/g, "").toUpperCase();
  const len = clean.length;
  const out = new Uint8Array(Math.floor((len * 5) / 8));
  let val = 0;
  let bits = 0;
  let index = 0;

  for (let i = 0; i < len; i++) {
    const c = clean[i];
    const idx = base32chars.indexOf(c);
    if (idx === -1) {
      return new Uint8Array(0);
    }
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out[index++] = (val >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return out.subarray(0, index);
}

async function generateClientTOTP(secretBase32: string, timeOffset = 0): Promise<string> {
  try {
    const secretBytes = decodeBase32(secretBase32);
    if (secretBytes.length === 0) return "";

    const key = await window.crypto.subtle.importKey(
      "raw",
      secretBytes as any,
      { name: "HMAC", hash: { name: "SHA-1" } },
      false,
      ["sign"]
    );

    const timeInfo = Math.floor(Date.now() / 1000 / 30) + timeOffset;
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    
    const high = Math.floor(timeInfo / 0x100000000);
    const low = timeInfo % 0x100000000;
    view.setUint32(0, high, false);
    view.setUint32(4, low, false);

    const signature = await window.crypto.subtle.sign("HMAC", key, buffer);
    const hmacResult = new Uint8Array(signature);
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const code =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const otp = code % 1000000;
    return otp.toString().padStart(6, "0");
  } catch (error) {
    console.error("Lỗi khi tạo mã TOTP:", error);
    return "";
  }
}

function generateRandomBase32Secret(length = 16): string {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  if (typeof window !== "undefined" && window.crypto) {
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      secret += base32chars[randomValues[i] % base32chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      secret += base32chars[Math.floor(Math.random() * base32chars.length)];
    }
  }
  return secret;
}

export default function PubTwoFactor() {
  const [activeTab, setActiveTab] = useState<"generator" | "guide">("generator");

  const [secretKey, setSecretKey] = useState("");
  const [issuer, setIssuer] = useState("VaniStudio");
  const [account, setAccount] = useState("");
  const [saveLabel, setSaveLabel] = useState("");
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);

  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [copied, setCopied] = useState(false);

  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("vani_2fa_keys");
      if (raw) {
        try {
          setSavedKeys(JSON.parse(raw));
        } catch {
        }
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    const tick = async () => {
      const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTimeLeft(seconds);

      if (secretKey) {
        const generated = await generateClientTOTP(secretKey);
        if (active) {
          setToken(generated);
        }
      } else {
        setToken("");
      }
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [secretKey]);

  const copyToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success("Đã sao chép mã OTP thành công!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveKey = () => {
    if (!secretKey || !saveLabel.trim()) return;

    const newKey: SavedKey = {
      id: Date.now().toString(),
      label: saveLabel.trim(),
      secret: secretKey.toUpperCase().replace(/\s+/g, ""),
      issuer,
      account,
    };

    const updated = [newKey, ...savedKeys];
    setSavedKeys(updated);
    localStorage.setItem("vani_2fa_keys", JSON.stringify(updated));
    setSaveLabel("");
    toast.success(`Đã lưu cấu hình "${newKey.label}"`);
  };

  const handleDeleteKey = (id: string) => {
    const updated = savedKeys.filter((k) => k.id !== id);
    setSavedKeys(updated);
    localStorage.setItem("vani_2fa_keys", JSON.stringify(updated));
    toast.success("Đã xóa khóa khỏi thiết bị");
  };


  const otpAuthUri = secretKey
    ? `otpauth://totp/${encodeURIComponent(issuer || "VaniStudio")}:${encodeURIComponent(
        account || "user"
      )}?secret=${secretKey.replace(/\s+/g, "").toUpperCase()}&issuer=${encodeURIComponent(
        issuer || "VaniStudio"
      )}`
    : "";

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:shield-keyhole-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Trình Tạo 2FA (TOTP)</h1>
              <p className="text-sm text-muted-foreground">
                Tạo mã xác thực bảo mật 2 lớp (TOTP/2FA) và kiểm tra tính hợp lệ hoàn toàn offline.
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
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
            <button
              onClick={() => setActiveTab("generator")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeTab === "generator"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:shield-keyhole-line-duotone" className="size-4" />
              <span>Trình tạo & Quản lý</span>
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeTab === "guide"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:info-circle-line-duotone" className="size-4" />
              <span>Tìm hiểu về 2FA</span>
            </button>
          </div>
          {activeTab === "generator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <Card className="lg:col-span-5 p-5 bg-card/30 border-border flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-foreground">Cấu hình khóa 2FA</h3>
                  <p className="text-[11px] text-muted-foreground">Nhập khóa bí mật Base32 hiện tại hoặc tạo mới ngẫu nhiên.</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-foreground">Khóa bí mật (Secret Key)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 flex items-center">
                        <Input
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value.replace(/\s+/g, ""))}
                          className="pr-20 text-xs h-10"
                          placeholder="Nhập chuỗi khóa Base32..."
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                          {secretKey && (
                            <button
                              onClick={() => setSecretKey("")}
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                              title="Xóa khóa"
                            >
                              <Icon icon="solar:close-circle-line-duotone" className="size-4" />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              try {
                                const text = await navigator.clipboard.readText();
                                setSecretKey(text.trim().replace(/\s+/g, ""));
                                toast.success("Đã dán khóa bí mật từ bộ nhớ đệm");
                              } catch {
                                toast.error("Không thể đọc Clipboard. Vui lòng tự dán.");
                              }
                            }}
                            className="p-1 rounded"
                            title="Dán từ Clipboard"
                          >
                            <Icon icon="solar:clipboard-line-duotone" className="size-4" />
                          </button>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const randomSec = generateRandomBase32Secret(16);
                          setSecretKey(randomSec);
                          toast.success("Đã tạo khóa ngẫu nhiên mới!");
                        }}
                        className="gap-1.5 font-bold text-xs shrink-0 h-10 px-3"
                        title="Tạo khóa ngẫu nhiên mới"
                      >
                        <Icon icon="solar:restart-line-duotone" className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {SUGGESTED_AUTH_APPS.map((app) => (
                      <Popover key={app.name}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="size-12 p-1 rounded-xl shadow-sm border-border bg-white hover:bg-muted animate-fade-in" title={app.name}>
                            <img src={app.logoUrl} alt={app.name} className="w-full h-full object-cover rounded-lg" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-1.5 z-50" align="center" sideOffset={8}>
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] font-bold px-2 py-1 text-muted-foreground uppercase tracking-wide">
                              Tải {app.name}
                            </p>
                            <a href={app.appStoreUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-2 py-2 hover:bg-muted rounded-md transition-colors text-[13px] font-semibold text-foreground">
                              <AppStore className="size-5" />
                              App Store
                            </a>
                            <a href={app.playStoreUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-2 py-2 hover:bg-muted rounded-md transition-colors text-[13px] font-semibold text-foreground">
                              <GooglePlay className="size-5" />
                              Google Play
                            </a>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-border/40 pt-4 mt-1">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-bold text-foreground">Nhà phát hành (Issuer)</Label>
                      <Input
                        value={issuer}
                        onChange={(e) => setIssuer(e.target.value)}
                        className="text-xs"
                        placeholder="Vd: Google, GitHub, Facebook..."
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[11px] font-bold text-foreground">Tên tài khoản (Account/Email)</Label>
                      <Input
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        className="text-xs"
                        placeholder="Vd: user@gmail.com..."
                      />
                    </div>
                  </div>
                  {otpAuthUri && (
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-muted/20 gap-3 mt-2">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-border">
                        <CustomQRCode
                          value={otpAuthUri}
                          size={150}
                          color="#0f172a"
                          backgroundColor="#ffffff"
                          logoUrl="/vani-1.png"
                          logoSize={32}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground text-center max-w-[280px] leading-relaxed">
                        Quét mã QR trên bằng ứng dụng 2FA (Google Authenticator, Authy, Microsoft Authenticator) để liên kết thiết bị.
                      </span>
                    </div>
                  )}
                  {secretKey && (
                    <div className="border-t border-border/40 pt-4 flex flex-col gap-3">
                      <Label className="text-xs font-bold text-foreground">Lưu vào trình duyệt để sử dụng nhanh</Label>
                      <div className="flex gap-2">
                        <Input
                          value={saveLabel}
                          onChange={(e) => setSaveLabel(e.target.value)}
                          className="bg-background h-9 text-xs flex-1"
                          placeholder="Đặt tên khóa (Vd: VPS Admin, Git Vani)..."
                        />
                        <Button
                          variant="vanixjnk"
                          size="sm"
                          onClick={handleSaveKey}
                          disabled={!saveLabel.trim()}
                          className="h-9 px-4 text-xs font-bold"
                        >
                          <Icon icon="solar:diskette-line-duotone" className="size-4 mr-1.5" />
                          Lưu lại
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              <div className="lg:col-span-7 flex flex-col gap-6">
                <Card className="p-6 bg-card/30 border-border relative overflow-hidden">
                  <div className="absolute right-0 top-0 -z-10 size-40 rounded-full bg-vanixjnk/5 blur-3xl" />
                  {!secretKey ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                      <div className="size-14 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground/50">
                        <Icon icon="solar:shield-keyhole-line-duotone" className="text-3xl" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm text-foreground">Chưa nhập khóa bí mật</h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          Vui lòng điền khóa bí mật ở cột bên trái hoặc chọn một khóa đã lưu để bắt đầu tạo mã xác thực.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex flex-col gap-1.5 text-center sm:text-left">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mã OTP Hiện tại</span>
                        <div className="flex items-center gap-4 justify-center sm:justify-start">
                          <span className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-vanixjnk">
                            {token ? `${token.slice(0, 3)} ${token.slice(3, 6)}` : "000 000"}
                          </span>
                          <button
                            onClick={copyToClipboard}
                            className="size-9 rounded-xl bg-background border border-border hover:border-vanixjnk/30 text-muted-foreground hover:text-vanixjnk transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                            title="Sao chép mã"
                          >
                            <Icon
                              icon={copied ? "solar:check-circle-line-duotone" : "solar:copy-line-duotone"}
                              className="size-5"
                            />
                          </button>
                        </div>
                        {issuer && (
                          <span className="text-xs font-semibold text-muted-foreground/80 mt-1">
                            Tài khoản: {issuer} {account && `(${account})`}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="relative size-16 flex items-center justify-center">
                          <svg className="absolute inset-0 size-16 transform -rotate-90">
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              className="stroke-muted-foreground/10 fill-none"
                              strokeWidth="4"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="26"
                              className={cn(
                                "fill-none transition-all duration-1000 ease-linear",
                                timeLeft <= 5 ? "stroke-rose-500" : "stroke-vanixjnk"
                              )}
                              strokeWidth="4"
                              strokeDasharray={2 * Math.PI * 26}
                              strokeDashoffset={((30 - timeLeft) / 30) * 2 * Math.PI * 26}
                            />
                          </svg>
                          <span
                            className={cn(
                              "text-sm font-black z-10",
                              timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-foreground"
                            )}
                          >
                            {timeLeft}s
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">Thời gian đổi mã</span>
                      </div>
                    </div>
                  )}
                </Card>
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:folder-open-line-duotone" className="size-5 text-muted-foreground" />
                      <span className="font-bold text-xs text-foreground">Khóa bí mật đã lưu ({savedKeys.length})</span>
                    </div>
                    {savedKeys.length > 0 && (
                      <button
                        onClick={() => setIsClearAllDialogOpen(true)}
                        className="text-xs text-rose-500 hover:underline font-bold"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  {savedKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl bg-card/10 text-center gap-2">
                      <Icon icon="solar:safe-2-line-duotone" className="size-8 text-muted-foreground/30" />
                      <span className="text-xs text-muted-foreground font-semibold">Chưa có khóa nào lưu trên thiết bị</span>
                      <span className="text-[10px] text-muted-foreground/60 max-w-[240px]">
                        Lưu lại khóa của các tài khoản thường dùng giúp bạn truy cập trực tiếp trong các lần sau.
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                      {savedKeys.map((keyItem) => {
                        const isCurrentActive =
                          secretKey.toUpperCase().replace(/\s+/g, "") === keyItem.secret.toUpperCase();

                        return (
                          <div
                            key={keyItem.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group",
                              isCurrentActive
                                ? "border-vanixjnk bg-vanixjnk/5 text-vanixjnk"
                                : "border-border bg-background hover:bg-muted/40"
                            )}
                            onClick={() => {
                              setSecretKey(keyItem.secret);
                              setIssuer(keyItem.issuer || "");
                              setAccount(keyItem.account || "");
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "size-8 rounded-lg flex items-center justify-center shrink-0 border",
                                  isCurrentActive
                                    ? "bg-vanixjnk/15 border-vanixjnk/30 text-vanixjnk"
                                    : "bg-muted/50 border-border text-muted-foreground"
                                )}
                              >
                                <Icon icon="solar:shield-keyhole-line-duotone" className="size-4" />
                              </div>
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-xs font-bold text-foreground truncate max-w-[180px]">
                                  {keyItem.label}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                                  {keyItem.secret}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {isCurrentActive && (
                                <Badge variant="outline" className="h-5 text-[9px] font-bold px-1.5 border-vanixjnk/30 bg-vanixjnk/10 text-vanixjnk">
                                  Đang chạy
                                </Badge>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingKeyId(keyItem.id);
                                }}
                                className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Xóa khóa này"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

            </div>
          )}

          {activeTab === "guide" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                <div className="size-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                  <Icon icon="solar:question-square-line-duotone" className="size-5" />
                </div>
                <h4 className="font-bold text-xs text-foreground">Mã 2FA (TOTP) là gì?</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  TOTP (Time-based One-time Password) là mật khẩu sử dụng một lần thay đổi liên tục theo thời gian (thường là mỗi 30 giây). Thuật toán kết hợp một khóa bí mật (Secret Key) được chia sẻ giữa dịch vụ và bạn cùng với thời gian hiện tại để tạo ra mã 6 số ngẫu nhiên.
                </p>
              </Card>

              <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                <div className="size-9 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                  <Icon icon="solar:shield-up-line-duotone" className="size-5" />
                </div>
                <h4 className="font-bold text-xs text-foreground">Tại sao công cụ này an toàn?</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Công cụ 2FA Generator của Vani Studio hoạt động 100% trên trình duyệt client của bạn thông qua Web Crypto API. Khóa bí mật và mã OTP của bạn KHÔNG bao giờ được truyền tải qua internet hay lưu trữ trên bất kỳ máy chủ nào. Bạn thậm chí có thể tắt mạng (ngắt kết nối Wifi/4G) sau khi tải trang và công cụ vẫn hoạt động hoàn hảo.
                </p>
              </Card>

              <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Icon icon="solar:refresh-square-line-duotone" className="size-5" />
                </div>
                <h4 className="font-bold text-xs text-foreground">Cách khôi phục khi mất thiết bị?</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Khi bật 2FA trên bất kỳ dịch vụ nào, họ sẽ luôn cung cấp cho bạn một chuỗi ký tự dự phòng hoặc mã Recovery Code. Hãy lưu giữ chuỗi ký tự bí mật Base32 ở nơi an toàn (ghi ra sổ tay, két sắt bảo mật). Bạn chỉ cần nhập chuỗi ký tự bí mật đó vào công cụ này để phục hồi lại toàn bộ mã OTP.
                </p>
              </Card>

              <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                <div className="size-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                  <Icon icon="solar:danger-square-line-duotone" className="size-5" />
                </div>
                <h4 className="font-bold text-xs text-foreground">Lưu ý quan trọng về danh sách khóa đã lưu</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Danh sách khóa bạn lưu trong phần &quot;Khóa bí mật đã lưu&quot; được lưu trực tiếp vào bộ nhớ cục bộ (LocalStorage) của trình duyệt trên thiết bị này. Nếu bạn xóa dữ liệu duyệt web (Clear Cache/Cookies), danh sách này sẽ bị mất. Hãy chắc chắn rằng bạn luôn lưu trữ một bản sao dự phòng của các khóa bí mật quan trọng.
                </p>
              </Card>

            </div>
          )}
        </div>
      </div>

      <Dialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa toàn bộ khóa</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Hành động này sẽ xóa vĩnh viễn toàn bộ danh sách khóa bí mật đã lưu trên thiết bị này. Bạn có chắc chắn muốn tiếp tục?
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsClearAllDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setSavedKeys([]);
                localStorage.removeItem("vani_2fa_keys");
                setIsClearAllDialogOpen(false);
                toast.success("Đã xóa toàn bộ danh sách khóa");
              }}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingKeyId} onOpenChange={(open) => !open && setDeletingKeyId(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa khóa bí mật</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Hành động này sẽ xóa vĩnh viễn khóa bí mật{" "}
            <strong className="text-foreground">
              &quot;{savedKeys.find((k) => k.id === deletingKeyId)?.label}&quot;
            </strong>{" "}
            khỏi thiết bị. Bạn có chắc chắn muốn tiếp tục?
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeletingKeyId(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deletingKeyId) {
                  handleDeleteKey(deletingKeyId);
                  setDeletingKeyId(null);
                }
              }}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
