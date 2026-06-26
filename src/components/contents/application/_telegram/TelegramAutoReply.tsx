"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TIMEZONE_DATA } from "@/constants/timezones.constant";
import { TimePicker } from "@/components/vanixjnk/time-picker";

const navItems = [
  { name: "Tài khoản", href: "/application/telegram/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/telegram/logs", icon: "solar:document-text-line-duotone" },
];

export default function TelegramAutoReply() {
  const pathname = usePathname();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [timezoneDialogOpen, setTimezoneDialogOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");

  const { data: accountsData, isLoading: accountsLoading } = trpc.application.telegram.getAccounts.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const accountsList = accountsData || [];

  useEffect(() => {
    if (accountsList.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accountsList[0].id);
    }
  }, [accountsList, selectedAccountId]);

  const { data: responderData, isLoading: configLoading, refetch } = trpc.application.telegram.getAutoResponder.useQuery(
    { accountId: selectedAccountId },
    {
      enabled: !!selectedAccountId,
      refetchOnWindowFocus: false,
    }
  );

  const [isActive, setIsActive] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [detectionMode, setDetectionMode] = useState<"always" | "idle" | "outside_work_hours">("always");
  const [inactivityMinutes, setInactivityMinutes] = useState(10);
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [workStartHour, setWorkStartHour] = useState("08:00");
  const [workEndHour, setWorkEndHour] = useState("17:30");
  const [cooldownHours, setCooldownHours] = useState(4);
  const [markAsRead, setMarkAsRead] = useState(false);
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");

  useEffect(() => {
    if (responderData) {
      setIsActive(responderData.isActive);
      setReplyText(responderData.replyText);
      setDetectionMode(responderData.detectionMode as any);
      setInactivityMinutes(responderData.inactivityMinutes);
      setWorkDays(responderData.workDays);
      setWorkStartHour(responderData.workStartHour);
      setWorkEndHour(responderData.workEndHour);
      setCooldownHours(responderData.cooldownHours);
      setMarkAsRead(responderData.markAsRead);
      if ((responderData as any).timezone) {
        setTimezone((responderData as any).timezone);
      }
    }
  }, [responderData]);

  const updateAutoResponderMutation = trpc.application.telegram.updateAutoResponder.useMutation({
    onSuccess: () => {
      toast.success("Đã lưu cấu hình tự động trả lời thành công!");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Lưu cấu hình thất bại");
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) {
      toast.error("Không tìm thấy tài khoản để cấu hình");
      return;
    }
    if (!replyText.trim()) {
      toast.error("Vui lòng điền nội dung tin nhắn tự động trả lời!");
      return;
    }
    updateAutoResponderMutation.mutate({
      accountId: selectedAccountId,
      isActive,
      replyText,
      detectionMode,
      inactivityMinutes,
      workDays,
      workStartHour,
      workEndHour,
      timezone,
      cooldownHours,
      markAsRead,
    });
  };

  const handleToggleDay = (dayNum: number) => {
    const currentDays = [...workDays];
    if (currentDays.includes(dayNum)) {
      setWorkDays(currentDays.filter((d) => d !== dayNum));
    } else {
      setWorkDays([...currentDays, dayNum].sort());
    }
  };

  const daysOfWeek = [
    { label: "Hai", value: 1 },
    { label: "Ba", value: 2 },
    { label: "Tư", value: 3 },
    { label: "Năm", value: 4 },
    { label: "Sáu", value: 5 },
    { label: "Bảy", value: 6 },
    { label: "CN", value: 7 },
  ];

  const filteredTimezones = Object.values(TIMEZONE_DATA).filter((tz) =>
    tz.code.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.name.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.offset.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.country.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  const selectedAccountDetails = accountsList.find((a) => a.id === selectedAccountId);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="ph:telegram-logo-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Cấu hình Tự động trả lời</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tự động trả lời tin nhắn riêng tư khi tài khoản ngoại tuyến, thiết lập khung giờ làm việc và giãn cách chống spam.
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
          
          <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái tự động trả lời</p>
                <h3 className={cn("text-2xl font-extrabold tracking-tight", isActive ? "text-emerald-500" : "text-muted-foreground")}>
                  {isActive ? "Đang bật" : "Đang tắt"}
                </h3>
              </div>
              <div className={cn("size-10 rounded-lg flex items-center justify-center shrink-0 border", isActive ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/25" : "text-muted-foreground bg-muted border-border")}>
                <Icon icon="solar:chat-round-unread-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Chế độ hoạt động</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {detectionMode === "always" ? "Mọi thời điểm" : detectionMode === "idle" ? "Khi offline" : "Ngoài giờ"}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:settings-minimalistic-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Thời gian chờ chống spam</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {cooldownHours} giờ
                </h3>
              </div>
              <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:shield-warning-line-duotone" className="text-xl" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-b border-border/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
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

          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Icon icon="solar:user-id-line-duotone" className="text-xl text-vanixjnk" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Chọn tài khoản Telegram</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Cấu hình tự động trả lời sẽ áp dụng riêng cho từng số điện thoại.</p>
                </div>
              </div>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-full sm:w-80 h-10 text-[13px] justify-between bg-background border-border">
                  <SelectValue placeholder="Chọn tài khoản" />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {accountsList.map((acc) => {
                    const name = [acc.firstName, acc.lastName].filter(Boolean).join(" ").trim() || "Telegram Account";
                    return (
                      <SelectItem key={acc.id} value={acc.id} className="text-[13px]">
                        {name} ({acc.phone})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {accountsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-background/40">
                <div className="size-14 rounded-2xl text-muted-foreground bg-muted flex items-center justify-center mb-4">
                  <Icon icon="ph:telegram-logo-duotone" className="text-3xl" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Chưa có tài khoản Telegram kết nối</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Vui lòng thêm ít nhất một tài khoản Telegram ở trang danh sách tài khoản trước khi thực hiện cấu hình tự động trả lời.
                </p>
                <Link href="/application/telegram/accounts" className="mt-4">
                  <Button variant="vanixjnk" size="sm">
                    Đến trang tài khoản
                  </Button>
                </Link>
              </div>
            ) : configLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Icon icon="solar:restart-line-duotone" className="size-8 text-vanixjnk animate-spin mb-3" />
                <p className="text-xs text-muted-foreground">Đang tải cấu hình tự động trả lời...</p>
              </div>
            ) : (
              <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                  
                  <Card className="p-5 border-border bg-background/60 backdrop-blur-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:pen-new-square-line-duotone" className="text-lg text-vanixjnk" />
                        <h3 className="text-sm font-bold text-foreground">Nội dung tự động phản hồi</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-semibold">Kích hoạt:</span>
                        <Switch
                          checked={isActive}
                          onCheckedChange={setIsActive}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Nhập tin nhắn phản hồi tự động..."
                        className="min-h-[140px] text-[13px] leading-relaxed bg-background"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                        <span>💡 Gợi ý: Hãy cung cấp thông tin liên hệ khẩn cấp hoặc các kênh mua hàng tự động khác.</span>
                        <span>{replyText.length} ký tự</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-5 border-border bg-background/60 backdrop-blur-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                      <div className="size-6 rounded-md bg-vanixjnk/10 flex items-center justify-center text-vanixjnk">
                        <Icon icon="solar:settings-minimalistic-line-duotone" className="text-base" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Điều kiện & Quy tắc kích hoạt</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Kích hoạt khi nào?</label>
                        <Select
                          value={detectionMode}
                          onValueChange={(val: any) => setDetectionMode(val)}
                        >
                          <SelectTrigger className="w-full h-9 text-[13px] justify-between bg-background border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            <SelectItem value="always" className="text-[13px]">Trả lời mọi thời điểm (Always)</SelectItem>
                            <SelectItem value="idle" className="text-[13px]">Khi không hoạt động (Offline)</SelectItem>
                            <SelectItem value="outside_work_hours" className="text-[13px]">Ngoài giờ làm việc</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {detectionMode === "idle" && (
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Thời gian nhàn rỗi (Phút)</label>
                          <Input
                            type="number"
                            min="1"
                            max="1440"
                            className="h-9 text-[13px] bg-background"
                            value={inactivityMinutes}
                            onChange={(e) => setInactivityMinutes(parseInt(e.target.value) || 10)}
                          />
                        </div>
                      )}

                      {detectionMode === "outside_work_hours" && (
                        <div className="space-y-1.5 cursor-pointer" onClick={() => setTimezoneDialogOpen(true)}>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Múi giờ làm việc</label>
                          <div className="relative w-full">
                            {timezone && TIMEZONE_DATA[timezone] && (
                              <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center pointer-events-none">
                                <Icon icon={`circle-flags:${TIMEZONE_DATA[timezone].flag}`} className="size-5 rounded-full" />
                              </div>
                            )}
                            <Input
                              id="timezone"
                              type="text"
                              className={cn("cursor-pointer pr-10 read-only:bg-background w-full h-9 text-[13px]", timezone && TIMEZONE_DATA[timezone] && "pl-10")}
                              readOnly
                              value={timezone ? `${timezone} (${TIMEZONE_DATA[timezone]?.country || ""} - ${TIMEZONE_DATA[timezone]?.offset || ""})` : ""}
                              placeholder="Chọn múi giờ..."
                            />
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
                              <Icon icon="solar:alt-arrow-down-line-duotone" className="size-4" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {detectionMode === "outside_work_hours" && (
                      <div className="space-y-4 pt-3 border-t border-border/40">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Giờ bắt đầu làm việc</label>
                            <TimePicker
                              value={workStartHour}
                              onChange={(val) => setWorkStartHour(val || "08:00")}
                              placeholder="Chọn giờ bắt đầu..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Giờ kết thúc làm việc</label>
                            <TimePicker
                              value={workEndHour}
                              onChange={(val) => setWorkEndHour(val || "17:30")}
                              placeholder="Chọn giờ kết thúc..."
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Các ngày làm việc trong tuần</label>
                          <div className="flex flex-wrap gap-1.5">
                            {daysOfWeek.map((day) => {
                              const active = workDays.includes(day.value);
                              return (
                                <button
                                  type="button"
                                  key={day.value}
                                  onClick={() => handleToggleDay(day.value)}
                                  className={cn(
                                    "h-8 px-3 rounded-lg text-[13px] font-bold transition-all border outline-none cursor-pointer",
                                    active
                                      ? "bg-vanixjnk/10 border-vanixjnk/30 text-vanixjnk font-extrabold"
                                      : "bg-background border-border text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {day.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                <div className="space-y-6">
                  
                  <Card className="p-5 border-border bg-background/60 backdrop-blur-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/50 pb-3">
                      <Icon icon="solar:shield-warning-line-duotone" className="text-lg text-amber-500" />
                      <h3 className="text-sm font-bold text-foreground">Anti-spam & Nâng cao</h3>
                    </div>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Giãn cách gửi lại (Giờ)</label>
                          <span className="text-[10px] font-bold text-vanixjnk">{cooldownHours}h</span>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          className="h-8 text-[13px] bg-background"
                          value={cooldownHours}
                          onChange={(e) => setCooldownHours(parseInt(e.target.value) || 0)}
                        />
                        <p className="text-[9px] text-muted-foreground italic">Tránh gửi lặp đi lặp lại nhiều lần cho cùng một người trong khoảng thời gian này.</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-border/30">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-foreground block">Đánh dấu đã đọc</span>
                            <span className="text-[10px] text-muted-foreground block">Đánh dấu đã xem ngay sau khi gửi tin nhắn tự động.</span>
                          </div>
                          <Switch
                            checked={markAsRead}
                            onCheckedChange={setMarkAsRead}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Button
                    type="submit"
                    variant="vanixjnk"
                    disabled={updateAutoResponderMutation.isPending}
                    className="w-full h-11 rounded-xl font-bold gap-2 cursor-pointer"
                  >
                    {updateAutoResponderMutation.isPending ? (
                      <Icon icon="solar:restart-line-duotone" className="size-5 animate-spin" />
                    ) : (
                      <Icon icon="solar:diskette-line-duotone" className="text-lg" />
                    )}
                    Lưu cấu hình tự động trả lời
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      <Dialog open={timezoneDialogOpen} onOpenChange={setTimezoneDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6">
          <DialogHeader className="pr-6">
            <DialogTitle className="flex items-center gap-2.5">
              <div className="size-8 rounded-full text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:global-line-duotone" className="size-4.5" />
              </div>
              <span>Chọn múi giờ làm việc</span>
            </DialogTitle>
          </DialogHeader>
          <div className="relative my-3 shrink-0">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm múi giờ (ví dụ: Asia, GMT, UTC)..."
              value={timezoneSearch}
              onChange={(e) => setTimezoneSearch(e.target.value)}
              className="pl-9 h-9 text-[13px]"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] pr-1">
            {filteredTimezones.map((tz) => (
              <button
                key={tz.code}
                type="button"
                onClick={() => {
                  setTimezone(tz.code);
                  setTimezoneDialogOpen(false);
                  setTimezoneSearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm hover:bg-muted transition-colors cursor-pointer",
                  timezone === tz.code && "bg-accent font-medium text-vanixjnk"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon icon={`circle-flags:${tz.flag}`} className="size-5 rounded-full shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{tz.code}</span>
                    <span className="text-xs text-muted-foreground">{tz.country} - {tz.name}</span>
                  </div>
                </div>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{tz.offset}</span>
              </button>
            ))}
            {filteredTimezones.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Không tìm thấy múi giờ nào phù hợp
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
