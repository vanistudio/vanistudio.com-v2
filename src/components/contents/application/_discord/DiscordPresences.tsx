"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import DiscordProfileLivePreview from "@/components/vanixjnk/discord-profile-live-preview";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

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
  showTimer?: boolean;
  timerType?: "elapsed" | "remaining";
  timerValue?: number;
  streamUrl?: string;
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
  { name: "Lịch sử hoạt động", href: "/application/discord/logs", icon: "solar:document-text-line-duotone" },
];

export default function DiscordPresences() {
  const pathname = usePathname();

  const { data: presetsData, isLoading, refetch } = trpc.application.discord.getPresets.useQuery();
  const presets = (presetsData || []) as any[];

  const { data: accountsData } = trpc.application.discord.getAccounts.useQuery();
  const accounts = (accountsData || []) as any[];
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const createPresetMutation = trpc.application.discord.createPreset.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Đã tạo preset mới!");
    },
    onError: (err) => toast.error(err.message || "Tạo preset thất bại"),
  });

  const updatePresetMutation = trpc.application.discord.updatePreset.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Đã cập nhật preset!");
    },
    onError: (err) => toast.error(err.message || "Cập nhật preset thất bại"),
  });

  const deletePresetMutation = trpc.application.discord.deletePreset.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Đã xóa preset!");
    },
    onError: (err) => toast.error(err.message || "Xóa preset thất bại"),
  });

  const [selectedPreset, setSelectedPreset] = useState<PresencePreset | null>(null);
  const [isNewPresetOpen, setIsNewPresetOpen] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<"profile" | "rpc" | "assets-buttons">("profile");

  const [presetName, setPresetName] = useState("");
  const [status, setStatus] = useState<"online" | "idle" | "dnd" | "invisible">("online");
  const [customText, setCustomText] = useState("");
  const [customEmoji, setCustomEmoji] = useState("");
  const [bio, setBio] = useState("");

  const [activityType, setActivityType] = useState<"playing" | "streaming" | "listening" | "watching" | "competing">(
    "playing"
  );
  const [activityName, setActivityName] = useState("");
  const [appId, setAppId] = useState("");
  const [details, setDetails] = useState("");
  const [state, setState] = useState("");
  const [largeImage, setLargeImage] = useState("");
  const [largeText, setLargeText] = useState("");
  const [smallImage, setSmallImage] = useState("");
  const [smallText, setSmallText] = useState("");
  const [btn1Label, setBtn1Label] = useState("");
  const [btn1Url, setBtn1Url] = useState("");
  const [btn2Label, setBtn2Label] = useState("");
  const [btn2Url, setBtn2Url] = useState("");

  const [showTimer, setShowTimer] = useState<boolean>(false);
  const [timerType, setTimerType] = useState<"elapsed" | "remaining">("elapsed");
  const [timerValue, setTimerValue] = useState<number>(30);
  const [streamUrl, setStreamUrl] = useState<string>("");

  const [selectedAccountsToApply, setSelectedAccountsToApply] = useState<string[]>([]);

  const [newPresetName, setNewPresetName] = useState("");

  const handleSelectPreset = (preset: PresencePreset) => {
    setSelectedPreset(preset);
    setPresetName(preset.name);
    setStatus((preset as any).status ?? (preset as any).onlineStatus ?? "online");
    setCustomText((preset as any).customText || (preset as any).customStatusText || "");
    setCustomEmoji((preset as any).customEmoji || (preset as any).customStatusEmoji || "");
    setBio((preset as any).bio || "");

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
    setShowTimer(act.showTimer || false);
    setTimerType(act.timerType || "elapsed");
    setTimerValue(act.timerValue || 30);
    setStreamUrl(act.streamUrl || "");
  };

  const handleSavePreset = () => {
    if (!selectedPreset) return;

    updatePresetMutation.mutate({
      id: selectedPreset.id,
      name: presetName,
      onlineStatus: status,
      customStatusText: customText || null,
      customStatusEmoji: customEmoji || null,
      activities: [{
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
        showTimer,
        timerType,
        timerValue,
        streamUrl: streamUrl || undefined,
      }],
    });
  };

  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) {
      toast.error("Vui lòng điền tên Preset");
      return;
    }
    createPresetMutation.mutate({
      name: newPresetName,
      onlineStatus: "online",
      activities: [{ type: "playing", name: "Cửa hàng" }],
    });
    setIsNewPresetOpen(false);
    setNewPresetName("");
  };

  const handleDeletePreset = (id: string) => {
    if (presets.length <= 1) {
      toast.error("Hệ thống yêu cầu tối thiểu một Presence Preset.");
      return;
    }
    deletePresetMutation.mutate({ id });
  };

  const handleApplyPresetToAccounts = () => {
    if (selectedAccountsToApply.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 tài khoản để cập nhật!");
      return;
    }
    if (!selectedPreset) {
      toast.error("Vui lòng chọn một preset!");
      return;
    }
    const accountNames = accounts
      .filter((a: any) => selectedAccountsToApply.includes(a.id))
      .map((a: any) => `@${a.username}`)
      .join(", ");

    toast.success(`Đã gửi yêu cầu cập nhật Presence "${selectedPreset.name}" cho ${selectedAccountsToApply.length} tài khoản: ${accountNames}! (Tính năng Gateway đang phát triển)`);
  };

  const renderStatusIcon = (st: "online" | "idle" | "dnd" | "invisible", sizeClass = "size-3.5", idKey = "global") => {
    switch (st) {
      case "online":
        return (
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#23a55a" />
          </svg>
        );
      case "idle":
        return (
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id={`idle-mask-${idKey}`}>
                <circle cx="12" cy="12" r="10" fill="white" />
                <circle cx="7" cy="7" r="8" fill="black" />
              </mask>
            </defs>
            <circle cx="12" cy="12" r="10" fill="#f0b232" mask={`url(#idle-mask-${idKey})`} />
          </svg>
        );
      case "dnd":
        return (
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id={`dnd-mask-${idKey}`}>
                <circle cx="12" cy="12" r="10" fill="white" />
                <rect x="3" y="10" width="18" height="4" rx="2" fill="black" />
              </mask>
            </defs>
            <circle cx="12" cy="12" r="10" fill="#f23f43" mask={`url(#dnd-mask-${idKey})`} />
          </svg>
        );
      default:
        return (
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <mask id={`invisible-mask-${idKey}`}>
                <circle cx="12" cy="12" r="10" fill="white" />
                <circle cx="12" cy="12" r="5.2" fill="black" />
              </mask>
            </defs>
            <circle cx="12" cy="12" r="10" fill="#80848e" mask={`url(#invisible-mask-${idKey})`} />
          </svg>
        );
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
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${active
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

          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-6 pb-4 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground">Trạng thái & Rich Presence (RPC)</h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                Cấu hình trạng thái Online, Custom Status và Game RPC hiển thị trên Profile của selfbots.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 flex flex-col gap-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-card/30! border-border shadow-sm rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:folder-with-files-line-duotone" className="size-5 text-vanixjnk" />
                        <h3 className="text-sm font-extrabold text-foreground">Presets ({presets.length})</h3>
                      </div>
                      <Button
                        variant="vanixjnk"
                        size="xs"
                        onClick={() => setIsNewPresetOpen(true)}
                        className="cursor-pointer h-8 text-[11px]"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="size-3.5 mr-1" />
                        Tạo mới
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                      {presets.map((preset) => {
                        const isSelected = preset.id === selectedPreset?.id;
                        const actName = preset.activities[0]?.name || "Không có Game";
                        const typeText = preset.activities[0] ? getActivityTypeLabel(preset.activities[0].type) : "";

                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset)}
                            className={`flex items-start gap-3 w-full text-left p-3 rounded-xl border transition-all duration-200 relative group cursor-pointer ${isSelected
                                ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                              }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {renderStatusIcon(preset.status, "size-4.5", `preset-list-${preset.id}`)}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0 w-full pr-6">
                              <span className={`text-[13px] font-bold whitespace-normal md:whitespace-nowrap md:truncate md:block ${isSelected ? "text-vanixjnk" : "text-foreground"}`}>
                                {preset.name}
                              </span>
                              <span className="text-[10px] font-medium text-muted-foreground/80 whitespace-normal md:whitespace-nowrap md:truncate md:block font-mono">
                                {typeText} {actName}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePreset(preset.id);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 p-1 transition-all cursor-pointer"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                </div>


                <Card className="bg-card/30! border-border shadow-sm rounded-xl p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:pen-new-round-line-duotone" className="size-5 text-vanixjnk" />
                        <h3 className="text-sm font-extrabold text-foreground">
                          Thiết lập Preset: <span className="text-vanixjnk">{selectedPreset?.name || "Chưa chọn"}</span>
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={selectedAccountId} onValueChange={(val: string) => setSelectedAccountId(val)}>
                          <SelectTrigger className="w-auto h-8 text-[11px] bg-background border-border/80">
                            <SelectValue placeholder="Chọn tài khoản" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((a: any) => (
                              <SelectItem key={a.id} value={a.id} className="text-xs">
                                @{a.username || "unknown"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-8 text-[11px] font-semibold"
                          onClick={() => {
                            if (!selectedAccountId) {
                              toast.error("Vui lòng chọn một tài khoản!");
                              return;
                            }
                            toast.promise(
                              (async () => {
                                const res = await (trpc as any).application.discord.getCurrentPresence.fetch({ accountId: selectedAccountId });
                                if (res.status) setStatus(res.status as any);
                                if (res.customStatus) {
                                  if (res.customStatus.text) setCustomText(res.customStatus.text);
                                  if (res.customStatus.emoji) setCustomEmoji(res.customStatus.emoji);
                                }
                                if (res.bio) setBio(res.bio);
                                return res;
                              })(),
                              { loading: "Đang lấy dữ liệu...", success: "Đã lấy trạng thái!", error: "Lỗi" }
                            );
                          }}
                        >
                          <Icon icon="solar:download-square-line-duotone" className="size-3.5 mr-1" />
                          Lấy từ Discord
                        </Button>
                      </div>
                    </div>


                  <div className="grid grid-cols-3 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("profile")}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto cursor-pointer",
                        activeEditorTab === "profile"
                          ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon="solar:user-line-duotone" className="size-4" />
                      <span>Hồ sơ & Trạng thái</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("rpc")}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto cursor-pointer",
                        activeEditorTab === "rpc"
                          ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon="solar:gamepad-line-duotone" className="size-4" />
                      <span>Rich Presence (RPC)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditorTab("assets-buttons")}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto cursor-pointer",
                        activeEditorTab === "assets-buttons"
                          ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                          : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon icon="solar:link-line-duotone" className="size-4" />
                      <span>Ảnh & Nút liên kết</span>
                    </button>
                  </div>


                  {activeEditorTab === "profile" && (
                    <div className="mt-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tên Preset</label>
                          <Input
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            className="h-9 text-[13px] bg-background border-border/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Trạng thái hiển thị</label>
                          <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                            <SelectTrigger className="w-full h-9 text-[13px] bg-background border-border/80">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">
                                <div className="flex items-center gap-2 text-[13px]">
                                  {renderStatusIcon("online", "size-3.5", "sel-online")}
                                  <span>Trực tuyến (Online)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="idle">
                                <div className="flex items-center gap-2 text-[13px]">
                                  {renderStatusIcon("idle", "size-3.5", "sel-idle")}
                                  <span>Trạng thái chờ (Idle)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="dnd">
                                <div className="flex items-center gap-2 text-[13px]">
                                  {renderStatusIcon("dnd", "size-3.5", "sel-dnd")}
                                  <span>Không làm phiền (DnD)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="invisible">
                                <div className="flex items-center gap-2 text-[13px]">
                                  {renderStatusIcon("invisible", "size-3.5", "sel-inv")}
                                  <span>Ẩn danh (Invisible)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">Emoji trạng thái</label>
                          <Input
                            placeholder="Ví dụ: 🎮, 💻, 🔥"
                            value={customEmoji}
                            onChange={(e) => setCustomEmoji(e.target.value)}
                            className="h-9 text-[13px] bg-background border-border/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Chữ trạng thái (Status Text)</label>
                          <Input
                            placeholder="Ví dụ: Đang viết code..."
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            className="h-9 text-[13px] bg-background border-border/80"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Giới thiệu (Bio)</label>
                          <Input
                            placeholder="Mô tả bản thân..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="h-9 text-[13px] bg-background border-border/80"
                          />
                        </div>
                      </div>
                    </div>
                  )}


                  {activeEditorTab === "rpc" && (
                    <div className="mt-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">Loại hoạt động</label>
                          <Select value={activityType} onValueChange={(val: any) => setActivityType(val)}>
                            <SelectTrigger className="w-full h-9 text-[13px] bg-background border-border/80">
                              <SelectValue placeholder="Chọn hoạt động" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="playing">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Icon icon="solar:gamepad-line-duotone" className="size-4 text-vanixjnk" />
                                  <span>Playing (Đang chơi)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="streaming">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Icon icon="solar:videocamera-record-line-duotone" className="size-4 text-vanixjnk" />
                                  <span>Streaming (Trực tiếp)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="listening">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Icon icon="solar:music-note-line-duotone" className="size-4 text-vanixjnk" />
                                  <span>Listening (Đang nghe)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="watching">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Icon icon="solar:eye-line-duotone" className="size-4 text-vanixjnk" />
                                  <span>Watching (Đang xem)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="competing">
                                <div className="flex items-center gap-2 text-[13px]">
                                  <Icon icon="solar:cup-first-line-duotone" className="size-4 text-vanixjnk" />
                                  <span>Competing (Thi đấu)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tên Game / Hoạt động</label>
                          <Input
                            placeholder="Ví dụ: Valorant"
                            value={activityName}
                            onChange={(e) => setActivityName(e.target.value)}
                            className="h-9 text-[13px] bg-background border-border/80"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Application ID (Client ID)</label>
                        <Input
                          placeholder="ID ứng dụng đăng ký trên Discord Developer Portal"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          className="h-9 text-[13px] bg-background border-border/80 font-mono"
                        />
                      </div>

                      {activityType === "streaming" && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1">
                            <Icon icon="solar:videocamera-record-line-duotone" className="size-3.5" />
                            Stream URL (Twitch / YouTube)
                          </label>
                          <Input
                            placeholder="Ví dụ: https://twitch.tv/vanistudio"
                            value={streamUrl}
                            onChange={(e) => setStreamUrl(e.target.value)}
                            className="h-9 text-[13px] bg-background border-purple-500/30 focus-visible:border-purple-500/60 font-mono text-purple-200"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Details (Dòng 1)</label>
                          <Input
                            placeholder="Mô tả chi tiết..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="h-9 text-[13px] bg-background border-border/80"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">State (Dòng 2)</label>
                          <Input
                            placeholder="Trạng thái trận đấu..."
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="h-9 text-[13px] bg-background border-border/80"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-border/40 font-mono">
                        <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Icon icon="solar:clock-circle-line-duotone" className="size-4 text-vanixjnk" />
                          Thời gian hoạt động (Timestamps)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                            <div className="flex flex-col gap-0.5">
                              <label className="text-xs font-bold text-foreground">Hiển thị thời gian</label>
                              <span className="text-[10px] text-muted-foreground">Thời gian trôi qua/còn lại</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowTimer(!showTimer)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ${showTimer ? "bg-vanixjnk" : "bg-muted"}`}
                            >
                              <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-200 ${showTimer ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                          </div>

                          {showTimer && (
                            <>
                              <div className="space-y-1.5 font-sans">
                                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">Kiểu hiển thị</label>
                                <Select value={timerType} onValueChange={(val: any) => setTimerType(val)}>
                                  <SelectTrigger className="w-full h-9 text-[13px] bg-background border-border/80">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="elapsed">Đã trôi qua (Elapsed)</SelectItem>
                                    <SelectItem value="remaining">Thời gian còn lại (Remaining)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {timerType === "remaining" && (
                                <div className="space-y-1.5 font-sans">
                                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground font-mono">Số phút còn lại</label>
                                  <Input
                                    type="number"
                                    placeholder="Ví dụ: 30"
                                    value={timerValue}
                                    onChange={(e) => setTimerValue(Number(e.target.value))}
                                    className="h-9 text-[13px] bg-background border-border/80"
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditorTab === "assets-buttons" && (
                    <div className="mt-5 space-y-5 font-mono">

                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-1.5">
                          <Icon icon="solar:gallery-line-duotone" className="size-4 text-vanixjnk" />
                          Hình ảnh hiển thị (Assets)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Large Image URL</label>
                            <Input placeholder="Link ảnh lớn..." value={largeImage} onChange={(e) => setLargeImage(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Large Image Hover Text</label>
                            <Input placeholder="Hover text..." value={largeText} onChange={(e) => setLargeText(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Small Image URL</label>
                            <Input placeholder="Link ảnh nhỏ..." value={smallImage} onChange={(e) => setSmallImage(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Small Image Hover Text</label>
                            <Input placeholder="Hover text..." value={smallText} onChange={(e) => setSmallText(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                        </div>
                      </div>


                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-1.5">
                          <Icon icon="solar:link-line-duotone" className="size-4 text-vanixjnk" />
                          Nút liên kết (Buttons)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Button 1 Label</label>
                            <Input placeholder="Ví dụ: Tham gia Discord" value={btn1Label} onChange={(e) => setBtn1Label(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Button 1 URL</label>
                            <Input placeholder="http://..." value={btn1Url} onChange={(e) => setBtn1Url(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Button 2 Label</label>
                            <Input placeholder="Ví dụ: Website" value={btn2Label} onChange={(e) => setBtn2Label(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Button 2 URL</label>
                            <Input placeholder="http://..." value={btn2Url} onChange={(e) => setBtn2Url(e.target.value)} className="h-9 text-[13px] bg-background border-border/80" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-medium">Chọn tài khoản</span>
                          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto border border-border rounded-lg p-1.5 bg-background">
                            {accounts.map((acc: any) => {
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
                                  <span className={`size-4 rounded border flex items-center justify-center text-[10px] transition-colors ${isChecked ? "bg-vanixjnk border-vanixjnk text-white" : "border-muted-foreground/30"}`}>
                                    {isChecked ? "✓" : ""}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-between gap-2 pt-1 border-t border-border">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setSelectedAccountsToApply(accounts.map((a: any) => a.id))}
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
              <div className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-[88px]">

                <DiscordProfileLivePreview
                  status={status}
                  customEmoji={customEmoji}
                  customText={customText}
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
                  showTimer={showTimer}
                  timerType={timerType}
                  timerValue={timerValue}
                  streamUrl={streamUrl}
                  displayName="Vani Dev"
                  username="vanixjnk"
                />
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
                  className="h-9 text-[13px] bg-background border-border/80"
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
