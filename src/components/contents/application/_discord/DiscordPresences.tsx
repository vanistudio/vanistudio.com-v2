"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker } from "@/components/vanixjnk/color-picker";
import DiscordProfileLivePreview from "@/components/vanixjnk/discord-profile-live-preview";

interface PresenceActivity {
  type: "playing" | "streaming" | "listening" | "watching" | "competing";
  name: string;
  applicationId?: string;
  details?: string;
  state?: string;
  largeImage?: string;
  largeText?: string;
  smallImage?: string;
  smallText?: string;
  button1Label?: string;
  button1Url?: string;
  button2Label?: string;
  button2Url?: string;
}

interface PresencePreset {
  id: string;
  name: string;
  status: "online" | "idle" | "dnd" | "invisible";
  customText?: string;
  customEmoji?: string;
  bannerColor?: string;
  bio?: string;
  activities: PresenceActivity[];
}

const navItems = [
  { name: "Tài khoản", href: "/application/discord/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Trạng thái & Rich Presence", href: "/application/discord/presences", icon: "solar:gamepad-old-line-duotone" },
  { name: "Tự động hóa", href: "/application/discord/automations", icon: "solar:cpu-bolt-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/discord/logs", icon: "solar:document-text-line-duotone" },
];

const mockAccountsList = [
  { id: "1", username: "vanixjnk", discordId: "109283749283749283" },
  { id: "2", username: "clone_buyer_01", discordId: "209384759283748592" },
  { id: "3", username: "spammer_bot_99", discordId: "309284759182738495" },
  { id: "4", username: "dead_token_user", discordId: "409284759384758291" },
];

const mockPresets: PresencePreset[] = [
  {
    id: "preset-1",
    name: "Playing Valorant",
    status: "dnd",
    customText: "Đang leo rank không làm phiền",
    customEmoji: "🎮",
    bannerColor: "#5865F2",
    bio: "Software Engineer at Vani Studio\n🎮 Valorant player\n✉️ Contact me via support@vanistudio.com",
    activities: [
      {
        type: "playing",
        name: "Valorant",
        applicationId: "809283749283749",
        details: "Ranked (Competitive)",
        state: "In a Match (9-3)",
        largeImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60",
        largeText: "Valorant",
        smallImage: "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=150&auto=format&fit=crop&q=60",
        smallText: "Radiant Badge",
        button1Label: "Xem Stream",
        button1Url: "https://twitch.tv/vanixjnk"
      }
    ]
  },
  {
    id: "preset-2",
    name: "Listening Spotify Coding",
    status: "online",
    customText: "Đang viết code...",
    customEmoji: "💻",
    bannerColor: "#1db954",
    bio: "Music lover & Frontend Developer.\nListening to lo-fi coding tracks 🎧",
    activities: [
      {
        type: "listening",
        name: "Spotify",
        details: "Elysia (feat. Vani)",
        state: "Album: Summer Vibes 2026",
        largeImage: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150&auto=format&fit=crop&q=60",
        largeText: "Summer Vibes",
        button1Label: "Nghe cùng",
        button1Url: "https://open.spotify.com/track/123"
      }
    ]
  },
  {
    id: "preset-3",
    name: "Streaming League of Legends",
    status: "online",
    customText: "Đang leo Thách Đấu",
    customEmoji: "🏆",
    bannerColor: "#f59e0b",
    bio: "Grandmaster League player 🏆\nStreaming every day at 8 PM!",
    activities: [
      {
        type: "streaming",
        name: "League of Legends",
        details: "Chung Kết Thế Giới",
        state: "T1 vs WBG",
        largeImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=60",
        largeText: "Challenger Lobby",
        button1Label: "Xem ngay",
        button1Url: "https://youtube.com"
      }
    ]
  }
];

export default function DiscordPresences() {
  const pathname = usePathname();
  const [presets, setPresets] = useState<PresencePreset[]>(mockPresets);
  const [selectedPreset, setSelectedPreset] = useState<PresencePreset>(mockPresets[0]);
  const [isNewPresetOpen, setIsNewPresetOpen] = useState(false);

  const [presetName, setPresetName] = useState(selectedPreset.name);
  const [status, setStatus] = useState<"online" | "idle" | "dnd" | "invisible">(selectedPreset.status);
  const [customText, setCustomText] = useState(selectedPreset.customText || "");
  const [customEmoji, setCustomEmoji] = useState(selectedPreset.customEmoji || "");
  const [bannerColor, setBannerColor] = useState(selectedPreset.bannerColor || "#5865F2");
  const [bio, setBio] = useState(selectedPreset.bio || "Software Engineer at Vani Studio");

  const [activityType, setActivityType] = useState<"playing" | "streaming" | "listening" | "watching" | "competing">(
    selectedPreset.activities[0]?.type || "playing"
  );
  const [activityName, setActivityName] = useState(selectedPreset.activities[0]?.name || "");
  const [appId, setAppId] = useState(selectedPreset.activities[0]?.applicationId || "");
  const [details, setDetails] = useState(selectedPreset.activities[0]?.details || "");
  const [state, setState] = useState(selectedPreset.activities[0]?.state || "");
  const [largeImage, setLargeImage] = useState(selectedPreset.activities[0]?.largeImage || "");
  const [largeText, setLargeText] = useState(selectedPreset.activities[0]?.largeText || "");
  const [smallImage, setSmallImage] = useState(selectedPreset.activities[0]?.smallImage || "");
  const [smallText, setSmallText] = useState(selectedPreset.activities[0]?.smallText || "");
  const [btn1Label, setBtn1Label] = useState(selectedPreset.activities[0]?.button1Label || "");
  const [btn1Url, setBtn1Url] = useState(selectedPreset.activities[0]?.button1Url || "");
  const [btn2Label, setBtn2Label] = useState(selectedPreset.activities[0]?.button2Label || "");
  const [btn2Url, setBtn2Url] = useState(selectedPreset.activities[0]?.button2Url || "");

  const [rotatorInterval, setRotatorInterval] = useState("300");
  const [rotatorMode, setRotatorMode] = useState<"sequential" | "random">("sequential");
  const [rotatorActive, setRotatorActive] = useState(false);
  const [selectedForRotation, setSelectedForRotation] = useState<string[]>([mockPresets[0].id, mockPresets[1].id]);
  const [selectedAccountsToApply, setSelectedAccountsToApply] = useState<string[]>([]);

  const [newPresetName, setNewPresetName] = useState("");

  const handleSelectPreset = (preset: PresencePreset) => {
    setSelectedPreset(preset);
    setPresetName(preset.name);
    setStatus(preset.status);
    setCustomText(preset.customText || "");
    setCustomEmoji(preset.customEmoji || "");
    setBannerColor(preset.bannerColor || "#5865F2");
    setBio(preset.bio || "Software Engineer at Vani Studio");

    const act = preset.activities[0] || { type: "playing", name: "" };
    setActivityType(act.type);
    setActivityName(act.name);
    setAppId(act.applicationId || "");
    setDetails(act.details || "");
    setState(act.state || "");
    setLargeImage(act.largeImage || "");
    setLargeText(act.largeText || "");
    setSmallImage(act.smallImage || "");
    setSmallText(act.smallText || "");
    setBtn1Label(act.button1Label || "");
    setBtn1Url(act.button1Url || "");
    setBtn2Label(act.button2Label || "");
    setBtn2Url(act.button2Url || "");
  };

  const handleSavePreset = () => {
    const updated: PresencePreset = {
      id: selectedPreset.id,
      name: presetName,
      status,
      customText: customText || undefined,
      customEmoji: customEmoji || undefined,
      bannerColor: bannerColor || undefined,
      bio: bio || undefined,
      activities: [
        {
          type: activityType,
          name: activityName,
          applicationId: appId || undefined,
          details: details || undefined,
          state: state || undefined,
          largeImage: largeImage || undefined,
          largeText: largeText || undefined,
          smallImage: smallImage || undefined,
          smallText: smallText || undefined,
          button1Label: btn1Label || undefined,
          button1Url: btn1Url || undefined,
          button2Label: btn2Label || undefined,
          button2Url: btn2Url || undefined,
        }
      ]
    };

    setPresets((prev) =>
      prev.map((p) => (p.id === selectedPreset.id ? updated : p))
    );
    setSelectedPreset(updated);
    toast.success("Đã lưu thay đổi cấu hình Presence!");
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) {
      toast.error("Vui lòng điền tên Preset");
      return;
    }
    const newP: PresencePreset = {
      id: "preset-" + Date.now(),
      name: newPresetName,
      status: "online",
      bannerColor: "#5865F2",
      bio: "New Custom Profile",
      activities: [{ type: "playing", name: "Cửa hàng" }]
    };
    setPresets((prev) => [...prev, newP]);
    handleSelectPreset(newP);
    setIsNewPresetOpen(false);
    setNewPresetName("");
    toast.success("Đã tạo Preset mới!");
  };

  const handleDeletePreset = (id: string) => {
    if (presets.length <= 1) {
      toast.error("Hệ thống yêu cầu tối thiểu một Presence Preset.");
      return;
    }
    const remaining = presets.filter((p) => p.id !== id);
    setPresets(remaining);
    handleSelectPreset(remaining[0]);
    toast.info("Đã xóa Presence Preset.");
  };

  const toggleRotationItem = (id: string) => {
    setSelectedForRotation((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleRotator = (val: boolean) => {
    if (val && selectedForRotation.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 Preset để bắt đầu vòng xoay!");
      return;
    }
    setRotatorActive(val);
    if (val) {
      toast.success("Bắt đầu vòng xoay trạng thái tự động cho tất cả các token hoạt động!");
    } else {
      toast.info("Đã dừng vòng xoay trạng thái tự động.");
    }
  };

  const handleApplyPresetToAccounts = () => {
    if (selectedAccountsToApply.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 tài khoản để cập nhật!");
      return;
    }
    const accountNames = mockAccountsList
      .filter((a) => selectedAccountsToApply.includes(a.id))
      .map((a) => `@${a.username}`)
      .join(", ");
      
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Đang gửi yêu cầu cập nhật Rich Presence tới ${selectedAccountsToApply.length} tài khoản...`,
        success: `Đã cập nhật thành công Presence "${presetName}" cho các tài khoản: ${accountNames}!`,
        error: "Có lỗi xảy ra khi cập nhật."
      }
    );
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case "online": return "bg-green-500";
      case "idle": return "bg-amber-500";
      case "dnd": return "bg-red-500";
      default: return "bg-muted-foreground";
    }
  };

  const getActivityTypeLabel = (ty: string) => {
    switch (ty) {
      case "playing": return "Đang chơi";
      case "streaming": return "Đang phát trực tiếp";
      case "listening": return "Đang nghe";
      case "watching": return "Đang xem";
      case "competing": return "Đang thi đấu";
      default: return "Chơi";
    }
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:gamepad-old-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Trạng thái & Rich Presence (RPC)</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Cấu hình trạng thái Online, Custom Status và Game RPC hiển thị trên Profile của selfbots.
                </p>
              </div>
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

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          
          <div className="px-6 py-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                      active
                        ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      icon={item.icon}
                      className={`size-4 ${active ? "text-vanixjnk" : "text-muted-foreground"}`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Column 1: Presets list & Rotator */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                <Card className="border border-border/60 bg-background/50 backdrop-blur-sm rounded-lg p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-foreground">Danh sách Presets</h3>
                    <Button
                      variant="vanixjnk"
                      size="xs"
                      onClick={() => setIsNewPresetOpen(true)}
                      className="cursor-pointer"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="size-3.5 mr-1" />
                      Mới
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {presets.map((preset) => {
                      const isSelected = preset.id === selectedPreset.id;
                      const actName = preset.activities[0]?.name || "Không có Game";
                      const typeText = preset.activities[0] ? getActivityTypeLabel(preset.activities[0].type) : "";

                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                            isSelected
                              ? "bg-vanixjnk/10 border-vanixjnk/30 shadow-[0_0_12px_rgba(114,137,218,0.05)]"
                              : "bg-background/40 border-border/50 hover:bg-muted/30 hover:border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`size-3 rounded-full shrink-0 ${getStatusColor(preset.status)}`} />
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-xs text-foreground truncate">{preset.name}</span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {typeText} {actName}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePreset(preset.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 p-1 transition-all cursor-pointer"
                          >
                            <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="border border-border/60 bg-background/50 backdrop-blur-sm rounded-lg p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                      <Icon icon="solar:restart-line-duotone" className="size-4 text-emerald-500" />
                      Vòng xoay (Rotator)
                    </h3>
                    <Switch checked={rotatorActive} onCheckedChange={handleToggleRotator} />
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-normal">
                    Tự động xoay vòng thay đổi trạng thái của Token dựa trên các Preset được tích chọn bên dưới.
                  </p>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Khoảng thời gian đổi (giây)
                      </label>
                      <Input
                        type="number"
                        placeholder="300"
                        value={rotatorInterval}
                        onChange={(e) => setRotatorInterval(e.target.value)}
                        className="h-9 text-[13px] bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chế độ xoay</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setRotatorMode("sequential")}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                            rotatorMode === "sequential"
                              ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk"
                              : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          Tuần tự
                        </button>
                        <button
                          onClick={() => setRotatorMode("random")}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                            rotatorMode === "random"
                              ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk"
                              : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          Ngẫu nhiên
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Presets áp dụng
                      </label>
                      <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto border border-border rounded-lg p-2 bg-background">
                        {presets.map((p) => {
                          const isChecked = selectedForRotation.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleRotationItem(p.id)}
                              className="flex items-center justify-between p-1.5 rounded hover:bg-muted/45 cursor-pointer"
                            >
                              <span className="text-xs font-semibold truncate pr-2">{p.name}</span>
                              <div className={`size-4 rounded border flex items-center justify-center transition-all ${
                                isChecked ? "bg-vanixjnk border-vanixjnk text-foreground" : "border-border bg-background"
                              }`}>
                                {isChecked && <Icon icon="solar:check-bold" className="size-2.5" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Column 2: Configuration Form */}
              <div className="lg:col-span-6">
                <Card className="border border-border bg-card/10 rounded-lg p-5 flex flex-col gap-5">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-3">
                    <Icon icon="solar:pen-new-round-line-duotone" className="size-4.5 text-vanixjnk" />
                    Thiết lập Preset: <span className="text-vanixjnk">{selectedPreset.name}</span>
                  </h3>

                  <div className="space-y-5 max-h-[640px] overflow-y-auto pr-1">
                    
                    {/* Phần 1: Trạng thái & Hồ sơ */}
                    <div className="space-y-4 p-4 rounded-lg border border-border/40 bg-background/30">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <Icon icon="solar:user-bold" className="size-4 text-vanixjnk" />
                        Trạng thái & Hồ sơ
                      </h4>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tên Preset</label>
                        <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} className="h-9 text-[13px] bg-background" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Trạng thái Online</label>
                          <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                            <SelectTrigger className="w-full h-9 text-[13px] bg-background border-border">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                              <SelectItem value="online">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <div className="size-2.5 rounded-full bg-[#23a55a]" />
                                  <span>Online</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="idle">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <div className="size-2.5 rounded-full bg-[#f0b232]" />
                                  <span>Idle (Chờ)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="dnd">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <div className="size-2.5 rounded-full bg-[#f23f43]" />
                                  <span>Không làm phiền</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="invisible">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <div className="size-2.5 rounded-full bg-[#80848e]" />
                                  <span>Ẩn danh (Invisible)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Emoji trạng thái</label>
                          <Input
                            placeholder="Ví dụ: 🎮, 💻, 🔥"
                            value={customEmoji}
                            onChange={(e) => setCustomEmoji(e.target.value)}
                            className="h-9 text-[13px] bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chữ trạng thái custom</label>
                        <Input
                          placeholder="Ví dụ: Đang bận viết code..."
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="h-9 text-[13px] bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Màu Banner</label>
                          <ColorPicker value={bannerColor} onChange={setBannerColor} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Giới thiệu (Bio)</label>
                          <Input
                            placeholder="Mô tả bản thân..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="h-9 text-[13px] bg-background"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phần 2: Game & Activity RPC */}
                    <div className="space-y-4 p-4 rounded-lg border border-border/40 bg-background/30">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <Icon icon="solar:gamepad-bold" className="size-4 text-vanixjnk" />
                        Game & Activity RPC
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Loại hoạt động</label>
                          <Select value={activityType} onValueChange={(val: any) => setActivityType(val)}>
                            <SelectTrigger className="w-full h-9 text-[13px] bg-background border-border">
                              <SelectValue placeholder="Chọn hoạt động" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                              <SelectItem value="playing" className="text-[13px]">Playing (Đang chơi)</SelectItem>
                              <SelectItem value="streaming" className="text-[13px]">Streaming (Trực tiếp)</SelectItem>
                              <SelectItem value="listening" className="text-[13px]">Listening (Đang nghe)</SelectItem>
                              <SelectItem value="watching" className="text-[13px]">Watching (Đang xem)</SelectItem>
                              <SelectItem value="competing" className="text-[13px]">Competing (Thi đấu)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tên Game / Ứng dụng</label>
                          <Input
                            placeholder="Ví dụ: Valorant"
                            value={activityName}
                            onChange={(e) => setActivityName(e.target.value)}
                            className="h-9 text-[13px] bg-background"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Application ID (Client ID)</label>
                        <Input
                          placeholder="ID ứng dụng đăng ký trên Discord Developer Portal"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          className="h-9 text-[13px] bg-background"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Details (Dòng 1)</label>
                          <Input placeholder="Chi tiết..." value={details} onChange={(e) => setDetails(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State (Dòng 2)</label>
                          <Input placeholder="Trạng thái..." value={state} onChange={(e) => setState(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                      </div>
                    </div>

                    {/* Phần 3: Hình ảnh hiển thị (Assets) */}
                    <div className="space-y-4 p-4 rounded-lg border border-border/40 bg-background/30">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <Icon icon="solar:gallery-bold" className="size-4 text-vanixjnk" />
                        Hình ảnh hiển thị (Assets)
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Large Image URL</label>
                          <Input placeholder="Link ảnh lớn..." value={largeImage} onChange={(e) => setLargeImage(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Large Image Text</label>
                          <Input placeholder="Hover text..." value={largeText} onChange={(e) => setLargeText(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Small Image URL</label>
                          <Input placeholder="Link ảnh nhỏ..." value={smallImage} onChange={(e) => setSmallImage(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Small Image Text</label>
                          <Input placeholder="Hover text..." value={smallText} onChange={(e) => setSmallText(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                      </div>
                    </div>

                    {/* Phần 4: Nút liên kết (Buttons) */}
                    <div className="space-y-4 p-4 rounded-lg border border-border/40 bg-background/30">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-2">
                        <Icon icon="solar:link-bold" className="size-4 text-vanixjnk" />
                        Nút liên kết (Buttons)
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Button 1 Label</label>
                          <Input placeholder="Ví dụ: Tham gia Discord" value={btn1Label} onChange={(e) => setBtn1Label(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Button 1 URL</label>
                          <Input placeholder="http://..." value={btn1Url} onChange={(e) => setBtn1Url(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Button 2 Label</label>
                          <Input placeholder="Ví dụ: Xem Website" value={btn2Label} onChange={(e) => setBtn2Label(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Button 2 URL</label>
                          <Input placeholder="http://..." value={btn2Url} onChange={(e) => setBtn2Url(e.target.value)} className="h-9 text-[13px] bg-background" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto h-9 text-xs font-semibold gap-1.5 cursor-pointer">
                            <Icon icon="solar:users-group-two-rounded-line-duotone" className="size-4 text-muted-foreground" />
                            Áp dụng cho ({selectedAccountsToApply.length}) tài khoản
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3 flex flex-col gap-2" align="start">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chọn tài khoản</span>
                          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto border border-border rounded-lg p-1.5 bg-background">
                            {mockAccountsList.map((acc) => {
                              const isChecked = selectedAccountsToApply.includes(acc.id);
                              return (
                                <div
                                  key={acc.id}
                                  onClick={() => {
                                    setSelectedAccountsToApply(prev =>
                                      prev.includes(acc.id) ? prev.filter(id => id !== acc.id) : [...prev, acc.id]
                                    );
                                  }}
                                  className="flex items-center justify-between p-1.5 rounded hover:bg-muted/45 cursor-pointer"
                                >
                                  <span className="text-xs font-semibold truncate">@{acc.username}</span>
                                  <div className={`size-4 rounded border flex items-center justify-center transition-all ${
                                    isChecked ? "bg-vanixjnk border-vanixjnk text-foreground" : "border-border bg-background"
                                  }`}>
                                    {isChecked && <Icon icon="solar:check-bold" className="size-2.5" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between gap-2 pt-1 border-t border-border">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setSelectedAccountsToApply(mockAccountsList.map(a => a.id))}
                              className="text-[10px]"
                            >
                              Tất cả
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setSelectedAccountsToApply([])}
                              className="text-[10px] text-red-500 hover:text-red-600"
                            >
                              Bỏ chọn
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      {selectedAccountsToApply.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleApplyPresetToAccounts}
                          className="h-9 text-xs font-bold text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 cursor-pointer animate-pulse"
                        >
                          <Icon icon="solar:play-line-duotone" className="size-4" />
                          Cập nhật
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="vanixjnk"
                      onClick={handleSavePreset}
                      className="w-full sm:w-auto px-6 cursor-pointer"
                    >
                      Lưu Preset
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Column 3: Live Preview */}
              <div className="lg:col-span-3 flex flex-col gap-6 sticky top-6">
                <div className="w-full max-w-[300px] mx-auto flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                      <Icon icon="solar:monitor-play-line-duotone" className="size-4 text-vanixjnk" />
                      Live Preview
                    </h3>
                  </div>

                  <DiscordProfileLivePreview
                    status={status}
                    customEmoji={customEmoji}
                    customText={customText}
                    bannerColor={bannerColor}
                    bio={bio}
                    activityType={activityType}
                    activityName={activityName}
                    details={details}
                    state={state}
                    largeImage={largeImage}
                    largeText={largeText}
                    smallImage={smallImage}
                    smallText={smallText}
                    btn1Label={btn1Label}
                    btn1Url={btn1Url}
                    btn2Label={btn2Label}
                    btn2Url={btn2Url}
                    displayName="Vani Dev"
                    username="vanixjnk"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Dialog open={isNewPresetOpen} onOpenChange={setIsNewPresetOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleCreatePreset}>
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
                <Icon icon="solar:gamepad-old-line-duotone" className="text-2xl" />
              </div>
              <DialogTitle>Tạo Presence Preset mới</DialogTitle>
              <DialogDescription>
                Nhập tên preset để bắt đầu cấu hình trạng thái của riêng bạn.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tên Preset
                </label>
                <Input
                  placeholder="Ví dụ: Play Dota 2"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="h-9 text-[13px] bg-background"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewPresetOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="vanixjnk"
                className="cursor-pointer"
              >
                Tạo Preset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
