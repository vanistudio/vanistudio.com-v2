"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  type NotificationConfig,
  type SmtpServerConfig,
  type TelegramBotConfig,
  type DiscordWebhookConfig,
  type SlackWebhookConfig,
} from "@/defaults/extension.default";

const EMAIL_EVENTS = [
  { key: "user.register", name: "Đăng ký thành viên mới" },
  { key: "auth.forgot_password", name: "Yêu cầu khôi phục mật khẩu" },
  { key: "contact.new_submission", name: "Khách hàng gửi liên hệ (Client)" },
  { key: "contact.new_submission_admin", name: "Thông báo liên hệ mới (Admin)" },
  { key: "auth.two_factor_enabled", name: "Kích hoạt xác thực 2 lớp (2FA)" },
  { key: "auth.two_factor_disabled", name: "Tắt xác thực 2 lớp (2FA)" },
  { key: "auth.otp_verification", name: "Gửi mã xác thực OTP" },
  { key: "auth.register_verification", name: "Gửi mã xác minh tài khoản" },
  { key: "auth.password_changed", name: "Thông báo đổi mật khẩu thành công" },
  { key: "auth.login_detected", name: "Cảnh báo đăng nhập mới" },
  { key: "license.issued", name: "Bàn giao mã bản quyền sản phẩm" },
];

const ADMIN_EVENTS = [
  { key: "user.register_admin", name: "Thành viên mới đăng ký" },
  { key: "security.ip_banned", name: "Cảnh báo chặn IP hệ thống" },
  { key: "contact.new_submission_admin", name: "Khách hàng liên hệ mới" },
  { key: "blog.comment_created", name: "Bình luận bài viết Blog mới" },
];

const NOTIFICATION_CHANNELS = [
  {
    id: "email",
    name: "Email (SMTP Server)",
    icon: <Icon icon="logos:google-gmail" className="size-6" />,
    theme: { bg: "bg-[#EA4335]/10", border: "border-[#EA4335]/25", text: "text-[#EA4335]" },
    desc: "Cấu hình một hoặc nhiều SMTP Server để gửi các email xác thực, khôi phục mật khẩu, và thông báo.",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    icon: <Icon icon="logos:telegram" className="size-6" />,
    theme: { bg: "bg-[#26A5E4]/10", border: "border-[#26A5E4]/25", text: "text-[#26A5E4]" },
    desc: "Tích hợp Telegram Bot để đẩy tin nhắn thông báo tự động đến người dùng hoặc nhóm quản trị viên.",
  },
  {
    id: "discord",
    name: "Discord Webhook",
    icon: <Icon icon="logos:discord-icon" className="size-6" />,
    theme: { bg: "bg-indigo-500/10", border: "border-indigo-500/25", text: "text-indigo-500" },
    desc: "Sử dụng Discord Webhook để gửi bản ghi hoạt động và cảnh báo bảo mật trực tiếp vào kênh Discord.",
  },
  {
    id: "slack",
    name: "Slack Webhook",
    icon: <Icon icon="logos:slack-icon" className="size-6" />,
    theme: { bg: "bg-[#E01E5A]/10", border: "border-[#E01E5A]/25", text: "text-[#E01E5A]" },
    desc: "Kết nối Slack Webhook để đẩy thông tin hoạt động, CRM hoặc cảnh báo hệ thống vào các kênh nội bộ.",
  },
];

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: NotificationConfig;
  onConfigChange: (config: any) => void;
  onSave?: (customConfig?: any, customEnabled?: boolean) => Promise<void>;
  isSaving?: boolean;
}

export default function NotificationConfigComponent({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
  onSave,
  isSaving,
}: Props) {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const [smtpServers, setSmtpServers] = useState<SmtpServerConfig[]>([]);
  const [clientTelegramBot, setClientTelegramBot] = useState<NotificationConfig["clientTelegramBot"]>({
    botToken: "",
    chatId: "",
    isEnabled: false,
    triggers: [],
  });
  const [adminTelegramBots, setAdminTelegramBots] = useState<TelegramBotConfig[]>([]);
  const [clientDiscordWebhook, setClientDiscordWebhook] = useState<NotificationConfig["clientDiscordWebhook"]>({
    isEnabled: false,
    triggers: [],
  });
  const [adminDiscordWebhooks, setAdminDiscordWebhooks] = useState<DiscordWebhookConfig[]>([]);
  const [clientSlackWebhook, setClientSlackWebhook] = useState<NotificationConfig["clientSlackWebhook"]>({
    isEnabled: false,
    triggers: [],
  });
  const [adminSlackWebhooks, setAdminSlackWebhooks] = useState<SlackWebhookConfig[]>([]);

  const [editingSmtp, setEditingSmtp] = useState<Partial<SmtpServerConfig> | null>(null);
  const [editingTelegramBot, setEditingTelegramBot] = useState<Partial<TelegramBotConfig> | null>(null);
  const [editingDiscordWebhook, setEditingDiscordWebhook] = useState<Partial<DiscordWebhookConfig> | null>(null);
  const [editingSlackWebhook, setEditingSlackWebhook] = useState<Partial<SlackWebhookConfig> | null>(null);

  useEffect(() => {
    if (config) {
      setSmtpServers(config.smtpServers || []);
      setClientTelegramBot(config.clientTelegramBot || { botToken: "", chatId: "", isEnabled: false, triggers: [] });
      setAdminTelegramBots(config.adminTelegramBots || []);
      setClientDiscordWebhook(config.clientDiscordWebhook || { isEnabled: false, triggers: [] });
      setAdminDiscordWebhooks(config.adminDiscordWebhooks || []);
      setClientSlackWebhook(config.clientSlackWebhook || { isEnabled: false, triggers: [] });
      setAdminSlackWebhooks(config.adminSlackWebhooks || []);
    }
  }, [config]);

  const handleGlobalSave = async (
    newSmtp = smtpServers,
    newClientTg = clientTelegramBot,
    newAdminTg = adminTelegramBots,
    newClientDiscord = clientDiscordWebhook,
    newAdminDiscord = adminDiscordWebhooks,
    newClientSlack = clientSlackWebhook,
    newAdminSlack = adminSlackWebhooks
  ) => {
    const nextConfig: NotificationConfig = {
      smtpServers: newSmtp,
      clientTelegramBot: newClientTg,
      adminTelegramBots: newAdminTg,
      clientDiscordWebhook: newClientDiscord,
      adminDiscordWebhooks: newAdminDiscord,
      clientSlackWebhook: newClientSlack,
      adminSlackWebhooks: newAdminSlack,
    };

    onConfigChange(nextConfig);

    const anyEnabled =
      newSmtp.some((s) => s.isEnabled) ||
      newClientTg.isEnabled ||
      newAdminTg.some((b) => b.isEnabled) ||
      newClientDiscord.isEnabled ||
      newAdminDiscord.some((w) => w.isEnabled) ||
      newClientSlack.isEnabled ||
      newAdminSlack.some((w) => w.isEnabled);

    if (anyEnabled !== isEnabled) {
      onEnabledChange(anyEnabled);
    }

    if (onSave) {
      await onSave(nextConfig, anyEnabled);
    }
  };

  const handleToggleChannel = async (channelId: string, currentStatus: boolean) => {
    if (channelId === "email") {
      const updated = smtpServers.map((s) => ({ ...s, isEnabled: !currentStatus }));
      setSmtpServers(updated);
      await handleGlobalSave(updated);
    } else if (channelId === "telegram") {
      const nextClient = { ...clientTelegramBot, isEnabled: !currentStatus };
      const nextAdmin = adminTelegramBots.map((b) => ({ ...b, isEnabled: !currentStatus }));
      setClientTelegramBot(nextClient);
      setAdminTelegramBots(nextAdmin);
      await handleGlobalSave(smtpServers, nextClient, nextAdmin);
    } else if (channelId === "discord") {
      const nextClient = { ...clientDiscordWebhook, isEnabled: !currentStatus };
      const nextAdmin = adminDiscordWebhooks.map((w) => ({ ...w, isEnabled: !currentStatus }));
      setClientDiscordWebhook(nextClient);
      setAdminDiscordWebhooks(nextAdmin);
      await handleGlobalSave(smtpServers, clientTelegramBot, adminTelegramBots, nextClient, nextAdmin);
    } else if (channelId === "slack") {
      const nextClient = { ...clientSlackWebhook, isEnabled: !currentStatus };
      const nextAdmin = adminSlackWebhooks.map((w) => ({ ...w, isEnabled: !currentStatus }));
      setClientSlackWebhook(nextClient);
      setAdminSlackWebhooks(nextAdmin);
      await handleGlobalSave(
        smtpServers,
        clientTelegramBot,
        adminTelegramBots,
        clientDiscordWebhook,
        adminDiscordWebhooks,
        nextClient,
        nextAdmin
      );
    }
  };

  const getChannelStatus = (channelId: string): boolean => {
    if (channelId === "email") {
      return smtpServers.some((s) => s.isEnabled);
    }
    if (channelId === "telegram") {
      return clientTelegramBot.isEnabled || adminTelegramBots.some((b) => b.isEnabled);
    }
    if (channelId === "discord") {
      return clientDiscordWebhook.isEnabled || adminDiscordWebhooks.some((w) => w.isEnabled);
    }
    if (channelId === "slack") {
      return clientSlackWebhook.isEnabled || adminSlackWebhooks.some((w) => w.isEnabled);
    }
    return false;
  };

  const toggleTrigger = (currentTriggers: string[], key: string): string[] => {
    if (currentTriggers.includes(key)) {
      return currentTriggers.filter((t) => t !== key);
    } else {
      return [...currentTriggers, key];
    }
  };

  const handleSaveSmtpForm = () => {
    if (!editingSmtp) return;
    let nextServers = [...smtpServers];
    const isNew = !editingSmtp.id;
    const finalId = editingSmtp.id || `smtp_${Date.now()}`;

    const formattedSmtp: SmtpServerConfig = {
      id: finalId,
      name: editingSmtp.name || "SMTP Server",
      host: editingSmtp.host || "",
      port: Number(editingSmtp.port) || 465,
      secure: editingSmtp.secure ?? true,
      user: editingSmtp.user || "",
      pass: editingSmtp.pass || "",
      fromEmail: editingSmtp.fromEmail || "",
      fromName: editingSmtp.fromName || "",
      isEnabled: editingSmtp.isEnabled ?? true,
      isDefault: editingSmtp.isDefault ?? false,
      triggers: editingSmtp.triggers || [],
    };

    if (formattedSmtp.isDefault) {
      nextServers = nextServers.map((s) => ({ ...s, isDefault: false }));
    }

    if (isNew) {
      if (nextServers.length === 0) {
        formattedSmtp.isDefault = true;
      }
      nextServers.push(formattedSmtp);
    } else {
      nextServers = nextServers.map((s) => (s.id === finalId ? formattedSmtp : s));
    }

    setSmtpServers(nextServers);
    setEditingSmtp(null);
  };

  const handleDeleteSmtp = (id: string) => {
    const nextServers = smtpServers.filter((s) => s.id !== id);
    if (nextServers.length > 0 && !nextServers.some((s) => s.isDefault)) {
      nextServers[0].isDefault = true;
    }
    setSmtpServers(nextServers);
  };

  const handleSaveTelegramBotForm = () => {
    if (!editingTelegramBot) return;
    let nextBots = [...adminTelegramBots];
    const isNew = !editingTelegramBot.id;
    const finalId = editingTelegramBot.id || `tg_bot_${Date.now()}`;

    const formattedBot: TelegramBotConfig = {
      id: finalId,
      name: editingTelegramBot.name || "Telegram Admin Bot",
      botToken: editingTelegramBot.botToken || "",
      chatId: editingTelegramBot.chatId || "",
      isEnabled: editingTelegramBot.isEnabled ?? true,
      triggers: editingTelegramBot.triggers || [],
    };

    if (isNew) {
      nextBots.push(formattedBot);
    } else {
      nextBots = nextBots.map((b) => (b.id === finalId ? formattedBot : b));
    }

    setAdminTelegramBots(nextBots);
    setEditingTelegramBot(null);
  };

  const handleDeleteTelegramBot = (id: string) => {
    setAdminTelegramBots(adminTelegramBots.filter((b) => b.id !== id));
  };

  const handleSaveDiscordWebhookForm = () => {
    if (!editingDiscordWebhook) return;
    let nextWebhooks = [...adminDiscordWebhooks];
    const isNew = !editingDiscordWebhook.id;
    const finalId = editingDiscordWebhook.id || `discord_wh_${Date.now()}`;

    const formattedWebhook: DiscordWebhookConfig = {
      id: finalId,
      name: editingDiscordWebhook.name || "Discord Admin Webhook",
      webhookUrl: editingDiscordWebhook.webhookUrl || "",
      isEnabled: editingDiscordWebhook.isEnabled ?? true,
      triggers: editingDiscordWebhook.triggers || [],
    };

    if (isNew) {
      nextWebhooks.push(formattedWebhook);
    } else {
      nextWebhooks = nextWebhooks.map((w) => (w.id === finalId ? formattedWebhook : w));
    }

    setAdminDiscordWebhooks(nextWebhooks);
    setEditingDiscordWebhook(null);
  };

  const handleDeleteDiscordWebhook = (id: string) => {
    setAdminDiscordWebhooks(adminDiscordWebhooks.filter((w) => w.id !== id));
  };

  const handleSaveSlackWebhookForm = () => {
    if (!editingSlackWebhook) return;
    let nextWebhooks = [...adminSlackWebhooks];
    const isNew = !editingSlackWebhook.id;
    const finalId = editingSlackWebhook.id || `slack_wh_${Date.now()}`;

    const formattedWebhook: SlackWebhookConfig = {
      id: finalId,
      name: editingSlackWebhook.name || "Slack Admin Webhook",
      webhookUrl: editingSlackWebhook.webhookUrl || "",
      isEnabled: editingSlackWebhook.isEnabled ?? true,
      triggers: editingSlackWebhook.triggers || [],
    };

    if (isNew) {
      nextWebhooks.push(formattedWebhook);
    } else {
      nextWebhooks = nextWebhooks.map((w) => (w.id === finalId ? formattedWebhook : w));
    }

    setAdminSlackWebhooks(nextWebhooks);
    setEditingSlackWebhook(null);
  };

  const handleDeleteSlackWebhook = (id: string) => {
    setAdminSlackWebhooks(adminSlackWebhooks.filter((w) => w.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <Card className="shadow-sm border-border p-0! bg-card/30!">
        <div className="flex flex-col divide-y divide-border">
          {NOTIFICATION_CHANNELS.map((channel) => {
            const isActive = getChannelStatus(channel.id);

            return (
              <div
                key={channel.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div
                    className={cn(
                      "flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl border shadow-sm",
                      channel.theme.bg,
                      channel.theme.border
                    )}
                  >
                    {channel.icon}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm truncate">{channel.name}</span>
                      <Badge
                        variant={isActive ? "success" : "danger"}
                        className="text-[10px] px-1.5 py-0 h-5 whitespace-nowrap"
                      >
                        {isActive ? "Đang bật" : "Đã tắt"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                      {channel.desc}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveChannelId(channel.id)}
                    className="h-8 text-xs font-medium w-full sm:w-auto"
                  >
                    <Icon icon="solar:settings-line-duotone" className="mr-1.5 size-4" />
                    Cấu hình
                  </Button>
                  <Button
                    variant={isActive ? "danger" : "success"}
                    size="sm"
                    onClick={() => handleToggleChannel(channel.id, isActive)}
                    className="h-8 text-xs font-medium w-full sm:w-auto"
                    disabled={isSaving}
                  >
                    <Icon
                      icon={
                        isActive
                          ? "solar:close-circle-line-duotone"
                          : "solar:check-circle-line-duotone"
                      }
                      className="mr-1.5 size-4"
                    />
                    {isActive ? "Tắt kết nối" : "Bật kết nối"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Sheet open={!!activeChannelId} onOpenChange={(open) => !open && setActiveChannelId(null)}>
        <SheetContent className="sm:max-w-[650px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6 pb-2">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:bell-bing-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              Cấu hình {NOTIFICATION_CHANNELS.find((c) => c.id === activeChannelId)?.name}
            </SheetTitle>
            <SheetDescription>Thiết lập chi tiết các thông số kết nối và sự kiện gửi thông báo.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-background">
            {activeChannelId === "email" && (
              <div className="flex flex-col gap-5">
                {editingSmtp ? (
                  <div className="flex flex-col gap-5 border border-border/80 rounded-xl p-4 bg-muted/5">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <h4 className="text-[13px] font-bold text-foreground">
                        {editingSmtp.id ? "Hiệu chỉnh SMTP Server" : "Thêm mới SMTP Server"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSmtp(null)}
                        className="h-7 text-xs font-medium px-2"
                      >
                        Quay lại
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-[12px] font-bold text-foreground">Tên cấu hình</label>
                        <Input
                          placeholder="Ví dụ: VaniStudio Gmail SMTP"
                          value={editingSmtp.name || ""}
                          onChange={(e) => setEditingSmtp({ ...editingSmtp, name: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Máy chủ SMTP Host</label>
                        <Input
                          placeholder="smtp.gmail.com"
                          value={editingSmtp.host || ""}
                          onChange={(e) => setEditingSmtp({ ...editingSmtp, host: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Cổng kết nối Port</label>
                        <Input
                          type="number"
                          placeholder="465"
                          value={editingSmtp.port || ""}
                          onChange={(e) => setEditingSmtp({ ...editingSmtp, port: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Tên đăng nhập (Username)</label>
                        <Input
                          placeholder="email@example.com"
                          value={editingSmtp.user || ""}
                          onChange={(e) => setEditingSmtp({ ...editingSmtp, user: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Mật khẩu (Password / App Pass)</label>
                        <Input
                          type="password"
                          placeholder="••••••••••••••••"
                          value={editingSmtp.pass || ""}
                          onChange={(e) => setEditingSmtp({ ...editingSmtp, pass: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Email người gửi (From Email)</label>
                        <Input
                          placeholder="noreply@vanistudio.com"
                          value={editingSmtp.fromEmail || ""}
                          onChange={(e) => setEditingSmtp({ ...editingSmtp, fromEmail: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Tên người gửi hiển thị</label>
                        <Input
                          placeholder="VaniStudio Support"
                          value={editingSmtp.fromName || ""}
                          onChange={(e) => setEditingSmtp({ ...editingSmtp, fromName: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center justify-between col-span-2 py-2 border-t border-b border-border/40">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Xác thực SSL/TLS bảo mật</span>
                          <span className="text-[10px] text-muted-foreground">Kích hoạt kết nối mã hóa secure</span>
                        </div>
                        <Switch
                          checked={editingSmtp.secure ?? true}
                          onCheckedChange={(checked) => setEditingSmtp({ ...editingSmtp, secure: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between col-span-2 py-2 border-b border-border/40">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Đặt làm cấu hình SMTP mặc định</span>
                          <span className="text-[10px] text-muted-foreground">Mặc định dùng khi không chỉ định server cụ thể</span>
                        </div>
                        <Switch
                          checked={editingSmtp.isDefault ?? false}
                          onCheckedChange={(checked) => setEditingSmtp({ ...editingSmtp, isDefault: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between col-span-2 py-2 border-b border-border/40">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Kích hoạt hoạt động</span>
                          <span className="text-[10px] text-muted-foreground">Bật tắt trạng thái hoạt động của Server này</span>
                        </div>
                        <Switch
                          checked={editingSmtp.isEnabled ?? true}
                          onCheckedChange={(checked) => setEditingSmtp({ ...editingSmtp, isEnabled: checked })}
                        />
                      </div>

                      <div className="flex flex-col gap-3 col-span-2 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Sự kiện kích hoạt gửi email (Triggers)</span>
                          <span className="text-[10px] text-muted-foreground">Chọn các loại thông báo sử dụng SMTP này</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded-xl p-3 bg-card max-h-[220px] overflow-y-auto">
                          {EMAIL_EVENTS.map((evt) => {
                            const current = editingSmtp.triggers || [];
                            const isChecked = current.includes(evt.key);
                            return (
                              <div
                                key={evt.key}
                                onClick={() => setEditingSmtp({ ...editingSmtp, triggers: toggleTrigger(current, evt.key) })}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                                  isChecked
                                    ? "bg-blue-500/10 border-blue-500/25 text-blue-600"
                                    : "border-border/60 hover:bg-muted"
                                )}
                              >
                                <Icon
                                  icon={isChecked ? "solar:check-circle-line-duotone" : "solar:circle-line-duotone"}
                                  className="size-4 shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-bold truncate">{evt.name}</span>
                                  <span className="text-[9px] text-muted-foreground font-mono truncate">{evt.key}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Button variant="vanixjnk" size="sm" onClick={handleSaveSmtpForm} className="w-full font-bold mt-2">
                      Lưu cấu hình Server
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-foreground">Danh sách SMTP Server</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingSmtp({
                            name: "",
                            host: "",
                            port: 465,
                            secure: true,
                            user: "",
                            pass: "",
                            fromEmail: "",
                            fromName: "",
                            isEnabled: true,
                            isDefault: false,
                            triggers: [],
                          })
                        }
                        className="h-8 text-xs font-semibold"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
                        Thêm Server
                      </Button>
                    </div>

                    {smtpServers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/80 rounded-xl bg-muted/5">
                        <Icon icon="solar:letter-opened-line-duotone" className="size-8 opacity-40 mb-1.5" />
                        <span className="text-xs font-medium">Chưa cấu hình SMTP Server nào</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {smtpServers.map((server) => (
                          <div
                            key={server.id}
                            className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl hover:bg-muted/10 transition-all bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                <Icon icon="solar:server-line-duotone" className="size-5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground truncate">{server.name}</span>
                                  {server.isDefault && (
                                    <Badge className="text-[9px] px-1 py-0 h-4 bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                      Mặc định
                                    </Badge>
                                  )}
                                  <Badge variant={server.isEnabled ? "success" : "danger"} className="text-[9px] px-1 py-0 h-4">
                                    {server.isEnabled ? "Bật" : "Tắt"}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                                  {server.host}:{server.port} • {server.user}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingSmtp(server)}
                                className="size-8 rounded-lg hover:bg-muted"
                              >
                                <Icon icon="solar:pen-line-duotone" className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSmtp(server.id)}
                                className="size-8 rounded-lg hover:bg-rose-500/10 text-rose-500"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeChannelId === "telegram" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 border border-border/80 rounded-xl p-4 bg-muted/5">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h4 className="text-[13px] font-bold text-foreground">Client Telegram Notification (Hội viên)</h4>
                    <Switch
                      checked={clientTelegramBot.isEnabled}
                      onCheckedChange={(checked) => setClientTelegramBot({ ...clientTelegramBot, isEnabled: checked })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-foreground">Bot Token</label>
                      <Input
                        placeholder="Bot Token của Client Bot"
                        value={clientTelegramBot.botToken}
                        onChange={(e) => setClientTelegramBot({ ...clientTelegramBot, botToken: e.target.value })}
                        disabled={!clientTelegramBot.isEnabled}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-bold text-foreground">Chat ID nhận tin</label>
                      <Input
                        placeholder="@username hoặc chat_id"
                        value={clientTelegramBot.chatId}
                        onChange={(e) => setClientTelegramBot({ ...clientTelegramBot, chatId: e.target.value })}
                        disabled={!clientTelegramBot.isEnabled}
                      />
                    </div>

                    <div className="flex flex-col gap-3 col-span-2 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold">Sự kiện kích hoạt gửi tin</span>
                        <span className="text-[10px] text-muted-foreground">Chọn các sự kiện đẩy tin nhắn Telegram đến hội viên</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded-xl p-3 bg-card max-h-[160px] overflow-y-auto">
                        {ADMIN_EVENTS.map((evt) => {
                          const current = clientTelegramBot.triggers || [];
                          const isChecked = current.includes(evt.key);
                          return (
                            <div
                              key={evt.key}
                              onClick={() => {
                                if (!clientTelegramBot.isEnabled) return;
                                setClientTelegramBot({
                                  ...clientTelegramBot,
                                  triggers: toggleTrigger(current, evt.key),
                                });
                              }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                                isChecked
                                  ? "bg-sky-500/10 border-sky-500/25 text-sky-600"
                                  : "border-border/60 hover:bg-muted",
                                !clientTelegramBot.isEnabled && "opacity-50 pointer-events-none"
                              )}
                            >
                              <Icon
                                icon={isChecked ? "solar:check-circle-line-duotone" : "solar:circle-line-duotone"}
                                className="size-4 shrink-0"
                              />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-bold truncate">{evt.name}</span>
                                <span className="text-[9px] text-muted-foreground font-mono truncate">{evt.key}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {editingTelegramBot ? (
                  <div className="flex flex-col gap-5 border border-border/80 rounded-xl p-4 bg-muted/5">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <h4 className="text-[13px] font-bold text-foreground">
                        {editingTelegramBot.id ? "Hiệu chỉnh Admin Bot" : "Thêm mới Admin Bot"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTelegramBot(null)}
                        className="h-7 text-xs font-medium px-2"
                      >
                        Quay lại
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-[12px] font-bold text-foreground">Tên định danh</label>
                        <Input
                          placeholder="Ví dụ: Admin Logs Bot"
                          value={editingTelegramBot.name || ""}
                          onChange={(e) => setEditingTelegramBot({ ...editingTelegramBot, name: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Bot Token</label>
                        <Input
                          placeholder="Bot Token từ BotFather"
                          value={editingTelegramBot.botToken || ""}
                          onChange={(e) => setEditingTelegramBot({ ...editingTelegramBot, botToken: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-foreground">Chat ID nhận tin</label>
                        <Input
                          placeholder="Chat ID nhóm hoặc quản trị viên"
                          value={editingTelegramBot.chatId || ""}
                          onChange={(e) => setEditingTelegramBot({ ...editingTelegramBot, chatId: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center justify-between col-span-2 py-2 border-t border-b border-border/40">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Kích hoạt hoạt động</span>
                          <span className="text-[10px] text-muted-foreground">Bật tắt hoạt động của bot quản trị này</span>
                        </div>
                        <Switch
                          checked={editingTelegramBot.isEnabled ?? true}
                          onCheckedChange={(checked) =>
                            setEditingTelegramBot({ ...editingTelegramBot, isEnabled: checked })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-3 col-span-2 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Sự kiện đẩy thông báo (Triggers)</span>
                          <span className="text-[10px] text-muted-foreground">Chọn các loại sự kiện gửi tin nhắn của Bot này</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded-xl p-3 bg-card max-h-[160px] overflow-y-auto">
                          {ADMIN_EVENTS.map((evt) => {
                            const current = editingTelegramBot.triggers || [];
                            const isChecked = current.includes(evt.key);
                            return (
                              <div
                                key={evt.key}
                                onClick={() =>
                                  setEditingTelegramBot({
                                    ...editingTelegramBot,
                                    triggers: toggleTrigger(current, evt.key),
                                  })
                                }
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                                  isChecked
                                    ? "bg-sky-500/10 border-sky-500/25 text-sky-600"
                                    : "border-border/60 hover:bg-muted"
                                )}
                              >
                                <Icon
                                  icon={isChecked ? "solar:check-circle-line-duotone" : "solar:circle-line-duotone"}
                                  className="size-4 shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-bold truncate">{evt.name}</span>
                                  <span className="text-[9px] text-muted-foreground font-mono truncate">{evt.key}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Button variant="vanixjnk" size="sm" onClick={handleSaveTelegramBotForm} className="w-full font-bold mt-2">
                      Lưu cấu hình Bot Admin
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-foreground">Danh sách Bots quản trị (Admin Panel)</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingTelegramBot({
                            name: "",
                            botToken: "",
                            chatId: "",
                            isEnabled: true,
                            triggers: [],
                          })
                        }
                        className="h-8 text-xs font-semibold"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
                        Thêm Bot Admin
                      </Button>
                    </div>

                    {adminTelegramBots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/80 rounded-xl bg-muted/5">
                        <Icon icon="solar:bell-bing-line-duotone" className="size-8 opacity-40 mb-1.5" />
                        <span className="text-xs font-medium">Chưa cấu hình Admin Bot nào</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {adminTelegramBots.map((bot) => (
                          <div
                            key={bot.id}
                            className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl hover:bg-muted/10 transition-all bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                <Icon icon="solar:chat-round-dots-line-duotone" className="size-5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground truncate">{bot.name}</span>
                                  <Badge variant={bot.isEnabled ? "success" : "danger"} className="text-[9px] px-1 py-0 h-4">
                                    {bot.isEnabled ? "Bật" : "Tắt"}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                                  Token: {bot.botToken.substring(0, 10)}... • ChatID: {bot.chatId}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingTelegramBot(bot)}
                                className="size-8 rounded-lg hover:bg-muted"
                              >
                                <Icon icon="solar:pen-line-duotone" className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTelegramBot(bot.id)}
                                className="size-8 rounded-lg hover:bg-rose-500/10 text-rose-500"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeChannelId === "discord" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 border border-border/80 rounded-xl p-4 bg-muted/5">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h4 className="text-[13px] font-bold text-foreground">Client Discord Webhook</h4>
                    <Switch
                      checked={clientDiscordWebhook.isEnabled}
                      onCheckedChange={(checked) =>
                        setClientDiscordWebhook({ ...clientDiscordWebhook, isEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold">Sự kiện kích hoạt gửi tin</span>
                      <span className="text-[10px] text-muted-foreground">Chọn các sự kiện đẩy tin nhắn Discord Webhook đến hội viên</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded-xl p-3 bg-card max-h-[160px] overflow-y-auto">
                      {ADMIN_EVENTS.map((evt) => {
                        const current = clientDiscordWebhook.triggers || [];
                        const isChecked = current.includes(evt.key);
                        return (
                          <div
                            key={evt.key}
                            onClick={() => {
                              if (!clientDiscordWebhook.isEnabled) return;
                              setClientDiscordWebhook({
                                ...clientDiscordWebhook,
                                triggers: toggleTrigger(current, evt.key),
                              });
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                              isChecked
                                ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-600"
                                : "border-border/60 hover:bg-muted",
                              !clientDiscordWebhook.isEnabled && "opacity-50 pointer-events-none"
                            )}
                          >
                            <Icon
                              icon={isChecked ? "solar:check-circle-line-duotone" : "solar:circle-line-duotone"}
                              className="size-4 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold truncate">{evt.name}</span>
                              <span className="text-[9px] text-muted-foreground font-mono truncate">{evt.key}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {editingDiscordWebhook ? (
                  <div className="flex flex-col gap-5 border border-border/80 rounded-xl p-4 bg-muted/5">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <h4 className="text-[13px] font-bold text-foreground">
                        {editingDiscordWebhook.id ? "Hiệu chỉnh Admin Discord" : "Thêm mới Admin Discord"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDiscordWebhook(null)}
                        className="h-7 text-xs font-medium px-2"
                      >
                        Quay lại
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-[12px] font-bold text-foreground">Tên định danh</label>
                        <Input
                          placeholder="Ví dụ: Discord Logs Channel"
                          value={editingDiscordWebhook.name || ""}
                          onChange={(e) => setEditingDiscordWebhook({ ...editingDiscordWebhook, name: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-[12px] font-bold text-foreground">Webhook URL</label>
                        <Input
                          placeholder="https://discord.com/api/webhooks/..."
                          value={editingDiscordWebhook.webhookUrl || ""}
                          onChange={(e) => setEditingDiscordWebhook({ ...editingDiscordWebhook, webhookUrl: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center justify-between col-span-2 py-2 border-t border-b border-border/40">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Kích hoạt hoạt động</span>
                          <span className="text-[10px] text-muted-foreground">Bật tắt hoạt động của webhook Discord này</span>
                        </div>
                        <Switch
                          checked={editingDiscordWebhook.isEnabled ?? true}
                          onCheckedChange={(checked) =>
                            setEditingDiscordWebhook({ ...editingDiscordWebhook, isEnabled: checked })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-3 col-span-2 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Sự kiện đẩy thông báo (Triggers)</span>
                          <span className="text-[10px] text-muted-foreground">Chọn các loại sự kiện gửi Webhook</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded-xl p-3 bg-card max-h-[160px] overflow-y-auto">
                          {ADMIN_EVENTS.map((evt) => {
                            const current = editingDiscordWebhook.triggers || [];
                            const isChecked = current.includes(evt.key);
                            return (
                              <div
                                key={evt.key}
                                onClick={() =>
                                  setEditingDiscordWebhook({
                                    ...editingDiscordWebhook,
                                    triggers: toggleTrigger(current, evt.key),
                                  })
                                }
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                                  isChecked
                                    ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-600"
                                    : "border-border/60 hover:bg-muted"
                                )}
                              >
                                <Icon
                                  icon={isChecked ? "solar:check-circle-line-duotone" : "solar:circle-line-duotone"}
                                  className="size-4 shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-bold truncate">{evt.name}</span>
                                  <span className="text-[9px] text-muted-foreground font-mono truncate">{evt.key}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Button variant="vanixjnk" size="sm" onClick={handleSaveDiscordWebhookForm} className="w-full font-bold mt-2">
                      Lưu cấu hình Webhook Admin
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-foreground">Danh sách Webhooks Discord (Admin Logs)</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingDiscordWebhook({
                            name: "",
                            webhookUrl: "",
                            isEnabled: true,
                            triggers: [],
                          })
                        }
                        className="h-8 text-xs font-semibold"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
                        Thêm Webhook
                      </Button>
                    </div>

                    {adminDiscordWebhooks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/80 rounded-xl bg-muted/5">
                        <Icon icon="solar:bell-bing-line-duotone" className="size-8 opacity-40 mb-1.5" />
                        <span className="text-xs font-medium">Chưa cấu hình Admin Webhook nào</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {adminDiscordWebhooks.map((wh) => (
                          <div
                            key={wh.id}
                            className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl hover:bg-muted/10 transition-all bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                <Icon icon="logos:discord-icon" className="size-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground truncate">{wh.name}</span>
                                  <Badge variant={wh.isEnabled ? "success" : "danger"} className="text-[9px] px-1 py-0 h-4">
                                    {wh.isEnabled ? "Bật" : "Tắt"}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                                  Url: {wh.webhookUrl.substring(0, 30)}...
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingDiscordWebhook(wh)}
                                className="size-8 rounded-lg hover:bg-muted"
                              >
                                <Icon icon="solar:pen-line-duotone" className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDiscordWebhook(wh.id)}
                                className="size-8 rounded-lg hover:bg-rose-500/10 text-rose-500"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeChannelId === "slack" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 border border-border/80 rounded-xl p-4 bg-muted/5">
                  <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h4 className="text-[13px] font-bold text-foreground">Client Slack Webhook</h4>
                    <Switch
                      checked={clientSlackWebhook.isEnabled}
                      onCheckedChange={(checked) =>
                        setClientSlackWebhook({ ...clientSlackWebhook, isEnabled: checked })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold">Sự kiện kích hoạt gửi tin</span>
                      <span className="text-[10px] text-muted-foreground">Chọn các sự kiện đẩy tin nhắn Slack Webhook đến hội viên</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded-xl p-3 bg-card max-h-[160px] overflow-y-auto">
                      {ADMIN_EVENTS.map((evt) => {
                        const current = clientSlackWebhook.triggers || [];
                        const isChecked = current.includes(evt.key);
                        return (
                          <div
                            key={evt.key}
                            onClick={() => {
                              if (!clientSlackWebhook.isEnabled) return;
                              setClientSlackWebhook({
                                ...clientSlackWebhook,
                                triggers: toggleTrigger(current, evt.key),
                              });
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                              isChecked
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600"
                                : "border-border/60 hover:bg-muted",
                              !clientSlackWebhook.isEnabled && "opacity-50 pointer-events-none"
                            )}
                          >
                            <Icon
                              icon={isChecked ? "solar:check-circle-line-duotone" : "solar:circle-line-duotone"}
                              className="size-4 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold truncate">{evt.name}</span>
                              <span className="text-[9px] text-muted-foreground font-mono truncate">{evt.key}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {editingSlackWebhook ? (
                  <div className="flex flex-col gap-5 border border-border/80 rounded-xl p-4 bg-muted/5">
                    <div className="flex justify-between items-center pb-2 border-b border-border/50">
                      <h4 className="text-[13px] font-bold text-foreground">
                        {editingSlackWebhook.id ? "Hiệu chỉnh Admin Slack" : "Thêm mới Admin Slack"}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSlackWebhook(null)}
                        className="h-7 text-xs font-medium px-2"
                      >
                        Quay lại
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-[12px] font-bold text-foreground">Tên định danh</label>
                        <Input
                          placeholder="Ví dụ: Slack CRM Channel"
                          value={editingSlackWebhook.name || ""}
                          onChange={(e) => setEditingSlackWebhook({ ...editingSlackWebhook, name: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-[12px] font-bold text-foreground">Webhook URL</label>
                        <Input
                          placeholder="https://hooks.slack.com/services/..."
                          value={editingSlackWebhook.webhookUrl || ""}
                          onChange={(e) => setEditingSlackWebhook({ ...editingSlackWebhook, webhookUrl: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center justify-between col-span-2 py-2 border-t border-b border-border/40">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Kích hoạt hoạt động</span>
                          <span className="text-[10px] text-muted-foreground">Bật tắt hoạt động của webhook Slack này</span>
                        </div>
                        <Switch
                          checked={editingSlackWebhook.isEnabled ?? true}
                          onCheckedChange={(checked) =>
                            setEditingSlackWebhook({ ...editingSlackWebhook, isEnabled: checked })
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-3 col-span-2 pt-2">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-bold">Sự kiện đẩy thông báo (Triggers)</span>
                          <span className="text-[10px] text-muted-foreground">Chọn các sự kiện kích hoạt đẩy tin nhắn Webhook</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-border/60 rounded-xl p-3 bg-card max-h-[160px] overflow-y-auto">
                          {ADMIN_EVENTS.map((evt) => {
                            const current = editingSlackWebhook.triggers || [];
                            const isChecked = current.includes(evt.key);
                            return (
                              <div
                                key={evt.key}
                                onClick={() =>
                                  setEditingSlackWebhook({
                                    ...editingSlackWebhook,
                                    triggers: toggleTrigger(current, evt.key),
                                  })
                                }
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-left cursor-pointer transition-all",
                                  isChecked
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600"
                                    : "border-border/60 hover:bg-muted"
                                )}
                              >
                                <Icon
                                  icon={isChecked ? "solar:check-circle-line-duotone" : "solar:circle-line-duotone"}
                                  className="size-4 shrink-0"
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-bold truncate">{evt.name}</span>
                                  <span className="text-[9px] text-muted-foreground font-mono truncate">{evt.key}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <Button variant="vanixjnk" size="sm" onClick={handleSaveSlackWebhookForm} className="w-full font-bold mt-2">
                      Lưu cấu hình Webhook Admin
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-foreground">Danh sách Webhooks Slack (CRM Notifications)</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingSlackWebhook({
                            name: "",
                            webhookUrl: "",
                            isEnabled: true,
                            triggers: [],
                          })
                        }
                        className="h-8 text-xs font-semibold"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
                        Thêm Webhook
                      </Button>
                    </div>

                    {adminSlackWebhooks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/80 rounded-xl bg-muted/5">
                        <Icon icon="solar:bell-bing-line-duotone" className="size-8 opacity-40 mb-1.5" />
                        <span className="text-xs font-medium">Chưa cấu hình Admin Webhook nào</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {adminSlackWebhooks.map((wh) => (
                          <div
                            key={wh.id}
                            className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl hover:bg-muted/10 transition-all bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <Icon icon="logos:slack-icon" className="size-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-foreground truncate">{wh.name}</span>
                                  <Badge variant={wh.isEnabled ? "success" : "danger"} className="text-[9px] px-1 py-0 h-4">
                                    {wh.isEnabled ? "Bật" : "Tắt"}
                                  </Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                                  Url: {wh.webhookUrl.substring(0, 30)}...
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingSlackWebhook(wh)}
                                className="size-8 rounded-lg hover:bg-muted"
                              >
                                <Icon icon="solar:pen-line-duotone" className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSlackWebhook(wh.id)}
                                className="size-8 rounded-lg hover:bg-rose-500/10 text-rose-500"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border bg-card/20">
            <Button
              variant="vanixjnk"
              className="w-full font-bold text-sm"
              onClick={async () => {
                await handleGlobalSave();
                setActiveChannelId(null);
              }}
              disabled={isSaving || !!editingSmtp || !!editingTelegramBot || !!editingDiscordWebhook || !!editingSlackWebhook}
            >
              {isSaving ? (
                <Icon icon="solar:restart-line-duotone" className="size-5 animate-spin mr-2" />
              ) : (
                <Icon icon="solar:check-circle-line-duotone" className="size-5 mr-2" />
              )}
              Lưu thay đổi thiết lập kênh
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
