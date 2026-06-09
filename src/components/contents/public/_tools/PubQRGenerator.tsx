"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import QRCode from "qrcode";
import Image from "next/image";

// Extended interface for custom rendering
interface CustomQRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  logoUrl?: string;
  logoSize?: number;
  qrStyle?: "square" | "dots" | "rounded";
  finderStyle?: "square" | "rounded";
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export function CustomQRCode({
  value,
  size = 256,
  color = "#0f172a",
  backgroundColor = "#ffffff",
  logoUrl,
  logoSize = 48,
  qrStyle = "rounded",
  finderStyle = "rounded",
  errorCorrectionLevel = "H"
}: CustomQRCodeProps) {
  const qrData = useMemo(() => {
    if (!value) return null;
    try {
      return QRCode.create(value, {
        errorCorrectionLevel: errorCorrectionLevel,
      });
    } catch (e) {
      console.error("QR Generation Error", e);
      return null;
    }
  }, [value, errorCorrectionLevel]);

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

        // Skip central area if logo is enabled
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
          if (finderStyle === "rounded") {
            ops.push(
              <rect
                key={`m-${row}-${col}`}
                x={col}
                y={row}
                width={1}
                height={1}
                fill={color}
                rx={0.35}
                ry={0.35}
              />
            );
          } else {
            ops.push(
              <rect
                key={`m-${row}-${col}`}
                x={col}
                y={row}
                width={1}
                height={1}
                fill={color}
              />
            );
          }
        } else {
          if (qrStyle === "dots") {
            ops.push(
              <circle
                key={`m-${row}-${col}`}
                cx={col + 0.5}
                cy={row + 0.5}
                r={0.42}
                fill={color}
              />
            );
          } else if (qrStyle === "rounded") {
            ops.push(
              <rect
                key={`m-${row}-${col}`}
                x={col + 0.05}
                y={row + 0.05}
                width={0.9}
                height={0.9}
                rx={0.25}
                ry={0.25}
                fill={color}
              />
            );
          } else {
            ops.push(
              <rect
                key={`m-${row}-${col}`}
                x={col}
                y={row}
                width={1}
                height={1}
                fill={color}
              />
            );
          }
        }
      }
    }
    return ops;
  };

  return (
    <div
      className="relative overflow-hidden shadow-md border border-border"
      style={{
        width: size,
        height: size,
        background: backgroundColor,
        padding: size * 0.04,
        borderRadius: size * 0.08
      }}
    >
      <div className="relative z-10 w-full h-full">
        <svg
          id="qr-svg-element"
          width="100%"
          height="100%"
          viewBox={`0 0 ${matrixSize} ${matrixSize}`}
          style={{ display: "block" }}
        >
          {/* Background element for export rendering support */}
          <rect x={-2} y={-2} width={matrixSize + 4} height={matrixSize + 4} fill={backgroundColor} />
          {renderModules()}
        </svg>
      </div>

      {logoUrl && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl flex items-center justify-center shadow-lg border border-border z-30"
          style={{ width: logoSize + 8, height: logoSize + 8 }}
        >
          <div className="relative overflow-hidden rounded-lg" style={{ width: logoSize, height: logoSize }}>
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

// Preset color combos for QR
const STYLE_PRESETS = [
  {
    name: "Classic Slate",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    qrStyle: "rounded" as const,
    finderStyle: "rounded" as const
  },
  {
    name: "Deep Ocean",
    color: "#1d4ed8",
    backgroundColor: "#ffffff",
    qrStyle: "dots" as const,
    finderStyle: "rounded" as const
  },
  {
    name: "Sunset Crimson",
    color: "#be123c",
    backgroundColor: "#fff1f2",
    qrStyle: "rounded" as const,
    finderStyle: "rounded" as const
  },
  {
    name: "Forest Gold",
    color: "#0f5132",
    backgroundColor: "#f4f9f4",
    qrStyle: "square" as const,
    finderStyle: "square" as const
  },
  {
    name: "Vani Purple",
    color: "#6d28d9",
    backgroundColor: "#faf5ff",
    qrStyle: "dots" as const,
    finderStyle: "rounded" as const
  }
];

// Preset built-in logos
const LOGO_PRESETS = [
  { name: "Không logo", value: "" },
  { name: "Vani Studio", value: "/vani-1.png" },
  { name: "Facebook", value: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/a4/09/a0/a409a05b-801e-0899-3174-cdff12cf69c7/AppIcon-0-0-1x_U007emarketing-0-10-0-85-220.png/100x100bb.png" },
  { name: "Google", value: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/df/f2/07/dff20755-46aa-a417-640a-5c1cf7cb6c5e/AppIcon-0-0-1x_U007emarketing-0-85-220.png/100x100bb.png" },
  { name: "Wifi Network", value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230f172a'><path d='M12 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm-5.656-5.657a8.005 8.005 0 0 1 11.312 0L16.25 16.75a6.002 6.002 0 0 0-8.5 0l-1.406-1.407Zm-2.829-2.828a11.977 11.977 0 0 1 16.97 0l-1.414 1.414a9.979 9.979 0 0 0-14.142 0l-1.414-1.414Zm-2.828-2.829a15.962 15.962 0 0 1 22.627 0l-1.414 1.415a13.964 13.964 0 0 0-19.799 0L.69 9.686Z'/></svg>" }
];

interface HistoryItem {
  id: string;
  type: string;
  value: string;
  timestamp: number;
}

export default function PubQRGenerator() {
  const [activeTab, setActiveTab] = useState<"text" | "wifi" | "email" | "sms" | "phone" | "geo">("text");

  // Inputs
  const [textVal, setTextVal] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiSec, setWifiSec] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [mailTo, setMailTo] = useState("");
  const [mailSub, setMailSub] = useState("");
  const [mailBody, setMailBody] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsText, setSmsText] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [geoLat, setGeoLat] = useState("");
  const [geoLng, setGeoLng] = useState("");

  // Customization styling
  const [color, setColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrStyle, setQrStyle] = useState<"square" | "dots" | "rounded">("rounded");
  const [finderStyle, setFinderStyle] = useState<"square" | "rounded">("rounded");
  const [qrSize, setQrSize] = useState(256);
  const [ecl, setEcl] = useState<"L" | "M" | "Q" | "H">("H");

  // Logo state
  const [logoPreset, setLogoPreset] = useState("");
  const [customLogo, setCustomLogo] = useState("");
  const [logoSize, setLogoSize] = useState(48);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("vani_qr_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("vani_qr_history", JSON.stringify(newHistory));
  };

  // Compile final payload
  const finalValue = useMemo(() => {
    switch (activeTab) {
      case "wifi":
        if (!wifiSsid) return "";
        return `WIFI:S:${wifiSsid};T:${wifiSec};P:${wifiPass};H:${wifiHidden ? "true" : "false"};;`;
      case "email":
        if (!mailTo) return "";
        return `mailto:${mailTo}?subject=${encodeURIComponent(mailSub)}&body=${encodeURIComponent(mailBody)}`;
      case "sms":
        if (!smsPhone) return "";
        return `sms:${smsPhone}?body=${encodeURIComponent(smsText)}`;
      case "phone":
        if (!phoneVal) return "";
        return `tel:${phoneVal}`;
      case "geo":
        if (!geoLat || !geoLng) return "";
        return `geo:${geoLat},${geoLng}`;
      case "text":
      default:
        return textVal;
    }
  }, [activeTab, textVal, wifiSsid, wifiPass, wifiSec, wifiHidden, mailTo, mailSub, mailBody, smsPhone, smsText, phoneVal, geoLat, geoLng]);

  const activeLogo = useMemo(() => {
    return customLogo || logoPreset;
  }, [customLogo, logoPreset]);

  // Upload Custom Logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Vui lòng chọn hình ảnh nhỏ hơn 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogo(event.target.result as string);
        setLogoPreset("");
        toast.success("Đã tải lên Logo thành công!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Download PNG
  const handleDownloadPNG = () => {
    if (!finalValue) {
      toast.warning("Vui lòng điền nội dung để tạo mã QR trước.");
      return;
    }
    const svgEl = document.getElementById("qr-svg-element");
    if (!svgEl) return;

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = qrSize;
      canvas.height = qrSize;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(image, 0, 0, qrSize, qrSize);
        const png = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = png;
        downloadLink.download = `vani-qr-${activeTab}-${Date.now()}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        toast.success("Tải xuống PNG thành công!");
        addToHistory();
      }
    };
    image.src = blobURL;
  };

  // Handle Download SVG
  const handleDownloadSVG = () => {
    if (!finalValue) {
      toast.warning("Vui lòng điền nội dung để tạo mã QR trước.");
      return;
    }
    const svgEl = document.getElementById("qr-svg-element");
    if (!svgEl) return;

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(svgBlob);
    downloadLink.download = `vani-qr-${activeTab}-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("Tải xuống SVG thành công!");
    addToHistory();
  };

  // Copy Image to Clipboard
  const handleCopyImage = () => {
    if (!finalValue) {
      toast.warning("Vui lòng điền nội dung để tạo mã QR trước.");
      return;
    }
    const svgEl = document.getElementById("qr-svg-element");
    if (!svgEl) return;

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const blobURL = URL.createObjectURL(svgBlob);
    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = qrSize;
      canvas.height = qrSize;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(image, 0, 0, qrSize, qrSize);
        canvas.toBlob((blob) => {
          if (blob) {
            try {
              navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob })
              ]).then(() => {
                toast.success("Đã sao chép hình ảnh QR vào bộ nhớ tạm!");
                addToHistory();
              }).catch(() => {
                toast.error("Không thể sao chép hình ảnh trên trình duyệt này.");
              });
            } catch {
              toast.error("Trình duyệt không hỗ trợ Clipboard API cho hình ảnh.");
            }
          }
        }, "image/png");
      }
    };
    image.src = blobURL;
  };

  const addToHistory = () => {
    if (!finalValue) return;

    // Check duplicate
    const exists = history.find(item => item.value === finalValue);
    if (exists) return;

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      type: activeTab,
      value: finalValue,
      timestamp: Date.now()
    };

    const updated = [newItem, ...history.slice(0, 9)];
    saveHistory(updated);
  };

  const handleApplyPreset = (p: typeof STYLE_PRESETS[0]) => {
    setColor(p.color);
    setBgColor(p.backgroundColor);
    setQrStyle(p.qrStyle);
    setFinderStyle(p.finderStyle);
    toast.success(`Đã áp dụng mẫu "${p.name}"!`);
  };

  const getTabLabel = (type: string) => {
    switch (type) {
      case "wifi": return "Mạng Wifi";
      case "email": return "Thư điện tử";
      case "sms": return "Tin nhắn SMS";
      case "phone": return "Số điện thoại";
      case "geo": return "Vị trí bản đồ";
      case "text":
      default: return "Liên kết / Văn bản";
    }
  };

  const getTabIcon = (type: string) => {
    switch (type) {
      case "wifi": return "solar:transmission-line-duotone";
      case "email": return "solar:letter-line-duotone";
      case "sms": return "solar:chat-square-call-line-duotone";
      case "phone": return "solar:phone-line-duotone";
      case "geo": return "solar:map-point-line-duotone";
      case "text":
      default: return "solar:link-round-angle-line-duotone";
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Header */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[60px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:qr-code-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Trình Tạo Mã QR</h1>
              <p className="text-sm text-muted-foreground">
                Tạo mã QR tùy chỉnh chuyên nghiệp với biểu tượng (logo), màu sắc phong phú và định dạng xuất đa dạng.
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

      {/* Content Area */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          {/* Tabs Container */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full md:w-auto md:self-start whitespace-nowrap">
            {(["text", "wifi", "email", "sms", "phone", "geo"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0",
                  activeTab === tab
                    ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                    : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Icon icon={getTabIcon(tab)} className="size-4" />
                <span>{getTabLabel(tab)}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Settings & Form Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Form Input */}
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-foreground">1. Nhập thông tin mã QR</h3>
                  <p className="text-[11px] text-muted-foreground">Điền các trường dữ liệu tương ứng với kiểu QR của bạn.</p>
                </div>

                {activeTab === "text" && (
                  <div className="flex flex-col gap-2 mt-2">
                    <Label htmlFor="text-val" className="text-xs font-bold text-foreground">Liên kết (URL) hoặc Văn bản</Label>
                    <Textarea
                      id="text-val"
                      rows={5}
                      value={textVal}
                      onChange={(e) => setTextVal(e.target.value)}
                      placeholder="Nhập đường dẫn trang web (vd: https://vanistudio.com) hoặc văn bản bất kỳ..."
                      className="text-xs resize-y"
                    />
                  </div>
                )}

                {activeTab === "wifi" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wifi-ssid" className="text-xs font-bold text-foreground">Tên mạng Wifi (SSID)</Label>
                      <Input
                        id="wifi-ssid"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="Vd: Vani Studio Guest"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="wifi-pass" className="text-xs font-bold text-foreground">Mật khẩu (Password)</Label>
                      <Input
                        id="wifi-pass"
                        type="password"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder="Mật khẩu bảo mật"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-bold text-foreground">Bảo mật (Encryption)</Label>
                      <div className="flex gap-2">
                        {["WPA", "WEP", "nopass"].map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setWifiSec(type)}
                            className={cn(
                              "flex-1 text-xs h-9",
                              wifiSec === type && "border-vanixjnk/30 bg-vanixjnk/5 text-vanixjnk font-bold"
                            )}
                          >
                            {type === "nopass" ? "Mở (None)" : type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border border-border/60 p-3 rounded-lg bg-muted/10 mt-auto h-9">
                      <span className="text-xs font-bold text-foreground">Mạng ẩn (Hidden)</span>
                      <Switch
                        checked={wifiHidden}
                        onCheckedChange={setWifiHidden}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "email" && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="mail-to" className="text-xs font-bold text-foreground">Gửi đến (Email)</Label>
                      <Input
                        id="mail-to"
                        type="email"
                        value={mailTo}
                        onChange={(e) => setMailTo(e.target.value)}
                        placeholder="Vd: contact@vanistudio.com"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="mail-sub" className="text-xs font-bold text-foreground">Tiêu đề (Subject)</Label>
                      <Input
                        id="mail-sub"
                        value={mailSub}
                        onChange={(e) => setMailSub(e.target.value)}
                        placeholder="Vd: Liên hệ thiết kế giao diện"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="mail-body" className="text-xs font-bold text-foreground">Nội dung thư (Body)</Label>
                      <Textarea
                        id="mail-body"
                        rows={4}
                        value={mailBody}
                        onChange={(e) => setMailBody(e.target.value)}
                        placeholder="Nhập nội dung chi tiết soạn sẵn..."
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "sms" && (
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="sms-phone" className="text-xs font-bold text-foreground">Số điện thoại nhắn tin</Label>
                      <Input
                        id="sms-phone"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder="Vd: 0901234567"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="sms-text" className="text-xs font-bold text-foreground">Nội dung tin nhắn (SMS Body)</Label>
                      <Textarea
                        id="sms-text"
                        rows={4}
                        value={smsText}
                        onChange={(e) => setSmsText(e.target.value)}
                        placeholder="Nội dung tin nhắn soạn sẵn..."
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "phone" && (
                  <div className="flex flex-col gap-2 mt-2">
                    <Label htmlFor="phone-val" className="text-xs font-bold text-foreground">Số điện thoại gọi điện</Label>
                    <Input
                      id="phone-val"
                      value={phoneVal}
                      onChange={(e) => setPhoneVal(e.target.value)}
                      placeholder="Vd: +84901234567"
                      className="text-xs"
                    />
                  </div>
                )}

                {activeTab === "geo" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="geo-lat" className="text-xs font-bold text-foreground">Vĩ độ (Latitude)</Label>
                      <Input
                        id="geo-lat"
                        value={geoLat}
                        onChange={(e) => setGeoLat(e.target.value)}
                        placeholder="Vd: 10.762622"
                        className="text-xs"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="geo-lng" className="text-xs font-bold text-foreground">Kinh độ (Longitude)</Label>
                      <Input
                        id="geo-lng"
                        value={geoLng}
                        onChange={(e) => setGeoLng(e.target.value)}
                        placeholder="Vd: 106.660172"
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Customization Details */}
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-sm text-foreground">2. Tùy chỉnh màu sắc & kiểu dáng</h3>
                  <p className="text-[11px] text-muted-foreground">Tối ưu hóa vẻ đẹp của mã QR để khớp với thương hiệu của bạn.</p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Colors Pickers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-bold text-foreground">Màu điểm QR (Foreground)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-12 h-9 p-0.5 border cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="text-xs font-mono h-9 flex-1 uppercase"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-bold text-foreground">Màu nền QR (Background)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-12 h-9 p-0.5 border cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="text-xs font-mono h-9 flex-1 uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* QR Styles selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-bold text-foreground">Hình dáng điểm mã (Dots style)</Label>
                      <div className="flex gap-1.5">
                        {["square", "dots", "rounded"].map((style) => (
                          <Button
                            key={style}
                            variant="outline"
                            size="sm"
                            onClick={() => setQrStyle(style as any)}
                            className={cn(
                              "flex-1 text-xs capitalize h-9",
                              qrStyle === style && "border-vanixjnk/30 bg-vanixjnk/5 text-vanixjnk font-bold"
                            )}
                          >
                            {style === "square" ? "Vuông" : style === "dots" ? "Tròn" : "Bo góc"}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-bold text-foreground">Hình dáng 3 góc (Finders style)</Label>
                      <div className="flex gap-1.5">
                        {["square", "rounded"].map((style) => (
                          <Button
                            key={style}
                            variant="outline"
                            size="sm"
                            onClick={() => setFinderStyle(style as any)}
                            className={cn(
                              "flex-1 text-xs capitalize h-9",
                              finderStyle === style && "border-vanixjnk/30 bg-vanixjnk/5 text-vanixjnk font-bold"
                            )}
                          >
                            {style === "square" ? "Vuông góc" : "Bo tròn góc"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Error Correction Level */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold text-foreground">Mức độ sửa lỗi (Error Correction Level)</Label>
                    <div className="flex gap-1.5">
                      {["L", "M", "Q", "H"].map((level) => (
                        <Button
                          key={level}
                          variant="outline"
                          size="sm"
                          onClick={() => setEcl(level as any)}
                          className={cn(
                            "flex-1 text-xs h-9",
                            ecl === level && "border-vanixjnk/30 bg-vanixjnk/5 text-vanixjnk font-bold"
                          )}
                        >
                          {level === "L" ? "L (7% sửa lỗi)" : level === "M" ? "M (15%)" : level === "Q" ? "Q (25%)" : "H (30% - Khuyên dùng)"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Logo Customizer */}
                  <div className="border-t border-border/40 pt-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs font-bold text-foreground">Biểu tượng giữa QR (Logo)</Label>
                      <p className="text-[10px] text-muted-foreground">Mức độ sửa lỗi (H) được giữ mặc định khi có logo để đảm bảo quét chính xác.</p>
                    </div>

                    {/* Logo preset buttons */}
                    <div className="flex flex-wrap gap-2">
                      {LOGO_PRESETS.map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLogoPreset(preset.value);
                            setCustomLogo("");
                          }}
                          className={cn(
                            "text-xs h-9 px-3",
                            logoPreset === preset.value && !customLogo && "border-vanixjnk/30 bg-vanixjnk/5 text-vanixjnk font-bold"
                          )}
                        >
                          {preset.name}
                        </Button>
                      ))}

                      {/* Custom Upload button */}
                      <div className="relative">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "text-xs h-9 px-3 gap-1.5",
                            customLogo && "border-vanixjnk/30 bg-vanixjnk/5 text-vanixjnk font-bold"
                          )}
                        >
                          <Icon icon="solar:upload-line-duotone" className="size-4" />
                          <span>{customLogo ? "Đã chọn Logo riêng" : "Tải Logo lên"}</span>
                        </Button>
                      </div>
                    </div>

                    {activeLogo && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-foreground">Kích thước logo (px)</Label>
                          <span className="text-xs text-muted-foreground font-mono">{logoSize}px</span>
                        </div>
                        <Slider
                          min={24}
                          max={64}
                          step={2}
                          value={[logoSize]}
                          onValueChange={(val) => setLogoSize(val[0])}
                          className="py-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
              {/* QR Preview Card */}
              <Card className="p-6 bg-card/30 border-border flex flex-col items-center gap-6 text-center">
                <div className="flex flex-col gap-1 w-full">
                  <h3 className="font-bold text-sm text-foreground">Mã QR xem trước</h3>
                  <p className="text-[11px] text-muted-foreground">Mã QR sẽ cập nhật thời gian thực dựa trên các cấu hình nhập.</p>
                </div>

                {/* QR Display container */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-border/80 flex items-center justify-center min-h-[256px]">
                  {finalValue ? (
                    <CustomQRCode
                      value={finalValue}
                      size={240}
                      color={color}
                      backgroundColor={bgColor}
                      logoUrl={activeLogo}
                      logoSize={logoSize}
                      qrStyle={qrStyle}
                      finderStyle={finderStyle}
                      errorCorrectionLevel={ecl}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 gap-3 text-muted-foreground w-[240px] h-[240px]">
                      <Icon icon="solar:qr-code-bold-duotone" className="text-5xl opacity-40 animate-pulse text-vanixjnk" />
                      <span className="text-xs leading-relaxed max-w-[180px]">Vui lòng nhập dữ liệu để bắt đầu tạo mã QR.</span>
                    </div>
                  )}
                </div>

                {/* Download Actions */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={handleDownloadPNG}
                      disabled={!finalValue}
                      variant="vanixjnk"
                      className="flex-1 font-bold text-xs gap-1.5 h-10 shadow-sm"
                    >
                      <Icon icon="solar:download-line-duotone" className="size-4" />
                      Tải ảnh PNG
                    </Button>
                    <Button
                      onClick={handleDownloadSVG}
                      disabled={!finalValue}
                      variant="outline"
                      className="flex-1 font-bold text-xs gap-1.5 h-10 shadow-sm"
                    >
                      <Icon icon="solar:file-text-line-duotone" className="size-4" />
                      Tải file SVG
                    </Button>
                  </div>
                  <Button
                    onClick={handleCopyImage}
                    disabled={!finalValue}
                    variant="secondary"
                    className="w-full font-bold text-xs gap-1.5 h-10 border border-border bg-white text-foreground hover:bg-muted"
                  >
                    <Icon icon="solar:copy-line-duotone" className="size-4" />
                    Sao chép mã QR vào Clipboard
                  </Button>
                </div>
              </Card>

              {/* Style Presets */}
              <Card className="p-5 bg-card/30 border-border flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-xs text-foreground">Bộ mẫu thiết kế nhanh (Presets)</h3>
                  <p className="text-[10px] text-muted-foreground">Bấm để áp dụng các chủ đề màu sắc được định nghĩa sẵn.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset)}
                      className="flex items-center gap-2.5 p-2 rounded-lg border border-border bg-white hover:bg-muted text-left text-[11px] font-bold text-foreground transition-all shadow-sm"
                    >
                      <div
                        className="size-4.5 rounded-full border border-black/10 shrink-0"
                        style={{ background: preset.color }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* QR Generation History */}
              {history.length > 0 && (
                <Card className="p-5 bg-card/30 border-border flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-foreground">Lịch sử tạo gần đây</h3>
                    <button
                      onClick={() => saveHistory([])}
                      className="text-[10px] font-bold text-destructive hover:underline"
                    >
                      Xóa hết
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto scrollbar-none">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-border/60 bg-white/40 text-xs text-foreground gap-3 hover:bg-white/70 transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon icon={getTabIcon(item.type)} className="size-4 text-vanixjnk shrink-0" />
                          <span className="truncate font-medium text-[11px]">{item.value}</span>
                        </div>
                        <button
                          onClick={() => {
                            // Reload from history
                            setActiveTab(item.type as any);
                            if (item.type === "text") setTextVal(item.value);
                            if (item.type === "phone") setPhoneVal(item.value.replace("tel:", ""));
                            if (item.type === "sms") {
                              const match = item.value.match(/sms:(.*?)\?body=(.*)/);
                              if (match) {
                                setSmsPhone(match[1]);
                                setSmsText(decodeURIComponent(match[2]));
                              }
                            }
                            if (item.type === "email") {
                              const match = item.value.match(/mailto:(.*?)\?subject=(.*?)&body=(.*)/);
                              if (match) {
                                setMailTo(match[1]);
                                setMailSub(decodeURIComponent(match[2]));
                                setMailBody(decodeURIComponent(match[3]));
                              }
                            }
                            if (item.type === "wifi") {
                              const matchSsid = item.value.match(/S:(.*?);/);
                              const matchPass = item.value.match(/P:(.*?);/);
                              const matchSec = item.value.match(/T:(.*?);/);
                              if (matchSsid) setWifiSsid(matchSsid[1]);
                              if (matchPass) setWifiPass(matchPass[1]);
                              if (matchSec) setWifiSec(matchSec[1]);
                            }
                            if (item.type === "geo") {
                              const match = item.value.match(/geo:(.*?),(.*)/);
                              if (match) {
                                setGeoLat(match[1]);
                                setGeoLng(match[2]);
                              }
                            }
                            toast.success("Đã tải lại mã QR từ lịch sử!");
                          }}
                          className="text-[10px] font-bold text-vanixjnk hover:underline shrink-0"
                        >
                          Tải lại
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
