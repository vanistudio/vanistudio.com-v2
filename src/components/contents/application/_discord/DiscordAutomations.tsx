"use client";

import React, { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AutomationAction {
  id: string;
  type: "change_status" | "change_bio" | "send_message" | "auto_reply" | "send_webhook" | "join_guild";
  config: Record<string, any>;
}

interface AutomationRule {
  id: string;
  name: string;
  isEnabled: boolean;
  triggerType: "cron" | "interval" | "dm_received" | "mention_received";
  triggerConfig: Record<string, any>;
  actions: AutomationAction[];
  targetAccounts: string[];
}

const navItems = [
  { name: "Tài khoản", href: "/application/discord/accounts", icon: "solar:users-group-two-rounded-line-duotone" },
  { name: "Trạng thái & Rich Presence", href: "/application/discord/presences", icon: "solar:gamepad-old-line-duotone" },
  { name: "Tự động hóa", href: "/application/discord/automations", icon: "solar:cpu-bolt-line-duotone" },
  { name: "Lịch sử hoạt động", href: "/application/discord/logs", icon: "solar:document-text-line-duotone" },
];

const mockRules: AutomationRule[] = [
  {
    id: "rule-1",
    name: "Tự động trả lời khi nhận DM",
    isEnabled: true,
    triggerType: "dm_received",
    triggerConfig: {
      keywords: ["hello", "hi", "mua acc", "ib", "price"],
      cooldown: 60
    },
    targetAccounts: ["1", "2"],
    actions: [
      {
        id: "act-1",
        type: "auto_reply",
        config: {
          replyText: "Chào bạn, mình đang offline. Liên hệ Telegram @vani_support để được hỗ trợ nhanh nhất nhé! 🤖"
        }
      },
      {
        id: "act-2",
        type: "send_webhook",
        config: {
          webhookUrl: "https://discord.com/api/webhooks/123/abc",
          messageText: "Đã tự động phản hồi tin nhắn của @username"
        }
      }
    ]
  },
  {
    id: "rule-2",
    name: "Đổi trạng thái chơi game ban đêm",
    isEnabled: false,
    triggerType: "cron",
    triggerConfig: {
      cronExpr: "0 23 * * *"
    },
    targetAccounts: ["1"],
    actions: [
      {
        id: "act-3",
        type: "change_status",
        config: {
          presetId: "preset-1"
        }
      }
    ]
  },
  {
    id: "rule-3",
    name: "Spam tin nhắn quảng cáo định kỳ",
    isEnabled: false,
    triggerType: "interval",
    triggerConfig: {
      intervalMins: 30
    },
    targetAccounts: ["3"],
    actions: [
      {
        id: "act-4",
        type: "send_message",
        config: {
          channelId: "109283749283749283",
          messageText: "🌟 Dịch vụ thiết kế Web MMO giá cực rẻ tại vanistudio.com. Xem chi tiết bio!"
        }
      }
    ]
  }
];

export default function DiscordAutomations() {
  const pathname = usePathname();
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<AutomationRule>(mockRules[0]);
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);

  const [ruleName, setRuleName] = useState(selectedRule.name);
  const [triggerType, setTriggerType] = useState<"cron" | "interval" | "dm_received" | "mention_received">(
    selectedRule.triggerType
  );
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>(selectedRule.triggerConfig);
  const [actions, setActions] = useState<AutomationAction[]>(selectedRule.actions);
  const [targetAccounts, setTargetAccounts] = useState<string[]>(selectedRule.targetAccounts);

  const [newRuleName, setNewRuleName] = useState("");

  const handleSelectRule = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setRuleName(rule.name);
    setTriggerType(rule.triggerType);
    setTriggerConfig(rule.triggerConfig);
    setActions(rule.actions);
    setTargetAccounts(rule.targetAccounts);
  };

  const handleToggleRule = (id: string, val: boolean) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          toast.success(val ? `Đã bật tự động hóa "${r.name}"` : `Đã tắt tự động hóa "${r.name}"`);
          return { ...r, isEnabled: val };
        }
        return r;
      })
    );
    if (selectedRule.id === id) {
      setSelectedRule((prev) => ({ ...prev, isEnabled: val }));
    }
  };

  const handleSaveRule = () => {
    const updated: AutomationRule = {
      id: selectedRule.id,
      name: ruleName,
      isEnabled: selectedRule.isEnabled,
      triggerType,
      triggerConfig,
      actions,
      targetAccounts
    };

    setRules((prev) => prev.map((r) => (r.id === selectedRule.id ? updated : r)));
    setSelectedRule(updated);
    toast.success("Cập nhật quy trình tự động hóa thành công!");
  };

  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) {
      toast.error("Vui lòng điền tên Quy trình");
      return;
    }
    const newR: AutomationRule = {
      id: "rule-" + Date.now(),
      name: newRuleName,
      isEnabled: true,
      triggerType: "dm_received",
      triggerConfig: { keywords: [], cooldown: 30 },
      actions: [],
      targetAccounts: []
    };
    setRules((prev) => [...prev, newR]);
    handleSelectRule(newR);
    setIsNewRuleOpen(false);
    setNewRuleName("");
    toast.success("Đã khởi tạo quy trình tự động mới!");
  };

  const handleDeleteRule = (id: string) => {
    if (rules.length <= 1) {
      toast.error("Cần giữ lại ít nhất 1 quy trình tự động.");
      return;
    }
    const remaining = rules.filter((r) => r.id !== id);
    setRules(remaining);
    handleSelectRule(remaining[0]);
    toast.info("Đã xóa quy trình tự động.");
  };

  const handleAddAction = (type: AutomationAction["type"]) => {
    const newAct: AutomationAction = {
      id: "act-" + Date.now(),
      type,
      config: {}
    };
    setActions((prev) => [...prev, newAct]);
  };

  const handleRemoveAction = (actId: string) => {
    setActions((prev) => prev.filter((a) => a.id !== actId));
  };

  const handleUpdateActionConfig = (actId: string, key: string, value: any) => {
    setActions((prev) =>
      prev.map((a) => (a.id === actId ? { ...a, config: { ...a.config, [key]: value } } : a))
    );
  };

  const handleToggleAccountTarget = (accId: string) => {
    setTargetAccounts((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:cpu-bolt-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tự động hóa (Selfbot Workflows)</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Lập trình hành động tự động cho selfbot: Phản hồi tin nhắn, đổi status hẹn giờ, spam kênh quảng cáo, bắn Webhook.
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
              
              <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="border border-border bg-card rounded-xl p-4 sm:p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-foreground">Quy trình tự động</h3>
                    <Button
                      variant="vanixjnk"
                      size="xs"
                      onClick={() => setIsNewRuleOpen(true)}
                      className="cursor-pointer"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="size-3.5 mr-1" />
                      Thêm quy trình
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {rules.map((rule) => {
                      const isSelected = rule.id === selectedRule.id;
                      return (
                        <div
                          key={rule.id}
                          onClick={() => handleSelectRule(rule)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-2 ${
                            isSelected
                              ? "bg-vanixjnk/10 border-vanixjnk/25"
                              : "bg-background border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-foreground truncate pr-2">{rule.name}</span>
                            <Switch
                              checked={rule.isEnabled}
                              onCheckedChange={(val) => handleToggleRule(rule.id, val)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-[9px] font-semibold py-0 px-1 rounded bg-muted">
                              Trigger: {rule.triggerType}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-semibold py-0 px-1 rounded border-vanixjnk/25 bg-vanixjnk/15 text-vanixjnk dark:bg-vanixjnk/20">
                              {rule.actions.length} hành động
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="border border-border bg-card rounded-xl p-4 sm:p-5 flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                      <Icon icon="solar:settings-bold-duotone" className="size-4.5 text-vanixjnk" />
                      Thiết lập: <span className="text-vanixjnk">{selectedRule.name}</span>
                    </h3>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleDeleteRule(selectedRule.id)}
                      className="text-red-500 hover:bg-red-500/10 hover:text-red-600 font-bold cursor-pointer"
                    >
                      <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5 mr-1" />
                      Xóa quy trình
                    </Button>
                  </div>

                  <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tên quy trình</label>
                      <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} className="h-9 text-[13px]" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Tài khoản áp dụng quy trình
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {["1", "2", "3"].map((accId) => {
                          const isChecked = targetAccounts.includes(accId);
                          const username = accId === "1" ? "@vanixjnk" : accId === "2" ? "@clone_buyer_01" : "@spammer_bot_99";
                          return (
                            <button
                              key={accId}
                              onClick={() => handleToggleAccountTarget(accId)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk"
                                  : "bg-background border-border text-muted-foreground hover:bg-muted/40"
                              }`}
                            >
                              <Icon icon={isChecked ? "solar:check-circle-bold" : "solar:circle-line"} className="size-3.5" />
                              {username}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    <div className="space-y-3.5">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Icon icon="solar:bell-ring-line-duotone" className="size-4 text-emerald-500" />
                        1. Kích hoạt (Trigger)
                      </h4>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sự kiện kích hoạt</label>
                        <Select value={triggerType} onValueChange={(val: any) => setTriggerType(val)}>
                          <SelectTrigger className="w-full h-9 text-[13px] bg-background border-border">
                            <SelectValue placeholder="Chọn sự kiện kích hoạt" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            <SelectItem value="dm_received" className="text-[13px]">Khi nhận tin nhắn riêng (DM)</SelectItem>
                            <SelectItem value="mention_received" className="text-[13px]">Khi bị tag tên (@mention)</SelectItem>
                            <SelectItem value="cron" className="text-[13px]">Hẹn giờ cố định (Cron Job)</SelectItem>
                            <SelectItem value="interval" className="text-[13px]">Lặp lại định kỳ (Interval)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {triggerType === "dm_received" && (
                        <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/20">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Từ khóa nhận diện (cách nhau bằng dấu phẩy)</label>
                            <Input
                              placeholder="Ví dụ: hi, hello, ib, mua acc"
                              value={triggerConfig.keywords?.join(", ") || ""}
                              onChange={(e) =>
                                setTriggerConfig((prev) => ({
                                  ...prev,
                                  keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                                }))
                              }
                              className="h-9 text-[13px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Thời gian chờ lặp lại (cooldown - giây)</label>
                            <Input
                              type="number"
                              value={triggerConfig.cooldown || 30}
                              onChange={(e) =>
                                setTriggerConfig((prev) => ({ ...prev, cooldown: parseInt(e.target.value) || 30 }))
                              }
                              className="h-9 text-[13px]"
                            />
                          </div>
                        </div>
                      )}

                      {triggerType === "cron" && (
                        <div className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cú pháp Cron Expression</label>
                          <Input
                            placeholder="Ví dụ: 0 23 * * * (chạy vào 23:00 hàng ngày)"
                            value={triggerConfig.cronExpr || ""}
                            onChange={(e) => setTriggerConfig((prev) => ({ ...prev, cronExpr: e.target.value }))}
                            className="h-9 text-[13px]"
                          />
                        </div>
                      )}

                      {triggerType === "interval" && (
                        <div className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Khoảng thời gian lặp lại (phút)</label>
                          <Input
                            type="number"
                            placeholder="30"
                            value={triggerConfig.intervalMins || 30}
                            onChange={(e) =>
                              setTriggerConfig((prev) => ({ ...prev, intervalMins: parseInt(e.target.value) || 30 }))
                            }
                            className="h-9 text-[13px]"
                          />
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-border" />

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Icon icon="solar:double-alt-arrow-right-line-duotone" className="size-4 text-vanixjnk" />
                          2. Chuỗi hành động thực thi (Actions Chain)
                        </h4>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold gap-1 bg-background border-border cursor-pointer">
                              <Icon icon="solar:add-circle-line-duotone" className="size-3.5" />
                              Thêm hành động
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem onClick={() => handleAddAction("auto_reply")} className="text-[13px] cursor-pointer">
                              Phản hồi tự động
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddAction("change_status")} className="text-[13px] cursor-pointer">
                              Thay đổi trạng thái (Preset)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddAction("send_message")} className="text-[13px] cursor-pointer">
                              Gửi tin nhắn kênh cụ thể
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddAction("send_webhook")} className="text-[13px] cursor-pointer">
                              Bắn tin nhắn qua Webhook
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {actions.length === 0 ? (
                        <div className="py-6 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/5">
                          <Icon icon="solar:box-line-duotone" className="size-10 text-muted-foreground/50 mb-2" />
                          <span className="text-xs font-bold">Chưa cấu hình hành động nào</span>
                          <span className="text-[10px] mt-0.5">Chọn Thêm hành động ở góc trên để cấu hình thực thi.</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {actions.map((act, index) => (
                            <div
                              key={act.id}
                              className="border border-border bg-background rounded-lg p-3 relative flex flex-col gap-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="size-5 rounded-full bg-vanixjnk/10 text-vanixjnk flex items-center justify-center text-[10px] font-bold">
                                    {index + 1}
                                  </span>
                                  <span className="font-bold text-xs uppercase tracking-wide text-foreground">
                                    {act.type === "auto_reply" && "Hành động: Phản hồi tự động"}
                                    {act.type === "change_status" && "Hành động: Đổi trạng thái"}
                                    {act.type === "send_message" && "Hành động: Gửi tin nhắn đến kênh"}
                                    {act.type === "send_webhook" && "Hành động: Bắn Webhook"}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveAction(act.id)}
                                  className="text-muted-foreground hover:text-red-500 p-1 cursor-pointer"
                                >
                                  <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                                </button>
                              </div>

                              {act.type === "auto_reply" && (
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nội dung phản hồi</label>
                                  <Input
                                    placeholder="Ví dụ: Xin chào bạn..."
                                    value={act.config.replyText || ""}
                                    onChange={(e) => handleUpdateActionConfig(act.id, "replyText", e.target.value)}
                                    className="h-9 text-[13px]"
                                  />
                                </div>
                              )}

                              {act.type === "change_status" && (
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chọn Preset Trạng Thái</label>
                                  <Select
                                    value={act.config.presetId || ""}
                                    onValueChange={(val) => handleUpdateActionConfig(act.id, "presetId", val)}
                                  >
                                    <SelectTrigger className="w-full h-9 text-[13px] bg-background border-border">
                                      <SelectValue placeholder="-- Chọn Preset --" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start">
                                      <SelectItem value="preset-1" className="text-[13px]">Playing Valorant</SelectItem>
                                      <SelectItem value="preset-2" className="text-[13px]">Listening Spotify Coding</SelectItem>
                                      <SelectItem value="preset-3" className="text-[13px]">Streaming League of Legends</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {act.type === "send_message" && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ID Kênh Discord</label>
                                    <Input
                                      placeholder="Channel ID..."
                                      value={act.config.channelId || ""}
                                      onChange={(e) => handleUpdateActionConfig(act.id, "channelId", e.target.value)}
                                      className="h-9 text-[13px]"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nội dung tin nhắn</label>
                                    <Input
                                      placeholder="Nội dung..."
                                      value={act.config.messageText || ""}
                                      onChange={(e) => handleUpdateActionConfig(act.id, "messageText", e.target.value)}
                                      className="h-9 text-[13px]"
                                    />
                                  </div>
                                </div>
                              )}

                              {act.type === "send_webhook" && (
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Webhook URL</label>
                                    <Input
                                      placeholder="https://discord.com/api/webhooks..."
                                      value={act.config.webhookUrl || ""}
                                      onChange={(e) => handleUpdateActionConfig(act.id, "webhookUrl", e.target.value)}
                                      className="h-9 text-[13px]"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nội dung bắn webhook</label>
                                    <Input
                                      placeholder="Nội dung..."
                                      value={act.config.messageText || ""}
                                      onChange={(e) => handleUpdateActionConfig(act.id, "messageText", e.target.value)}
                                      className="h-9 text-[13px]"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-end">
                    <Button
                      variant="vanixjnk"
                      onClick={handleSaveRule}
                      className="px-6 cursor-pointer"
                    >
                      Lưu thay đổi quy trình
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isNewRuleOpen} onOpenChange={setIsNewRuleOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleCreateRuleSubmit}>
            <DialogHeader className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 mb-3">
                <Icon icon="solar:cpu-bolt-line-duotone" className="text-2xl" />
              </div>
              <DialogTitle>Tạo Quy trình Tự động hóa mới</DialogTitle>
              <DialogDescription>
                Nhập tên quy trình để thiết lập chuỗi Trigger & Actions tự động.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tên Quy trình
                </label>
                <Input
                  placeholder="Ví dụ: Tự động chúc mừng sinh nhật"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="h-9 text-[13px]"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewRuleOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="vanixjnk"
                className="cursor-pointer"
              >
                Tạo quy trình
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
