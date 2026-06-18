"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type NotificationTemplate } from "@/server/db/schemas/template.schema";
import { TelegramMessagePreview } from "@/components/vanixjnk/telegram-rich-message-builder";
import { DiscordEmbedBuilder, DiscordMessagePreview } from "@/components/vanixjnk/discord-embed-builder";
import { SlackBlockBuilder, SlackMessagePreview } from "@/components/vanixjnk/slack-block-kit-builder";
import type { DiscordEmbed } from "@/components/vanixjnk/discord-embed-builder/discord-embed-builder";
import type { SlackBlock } from "@/components/vanixjnk/slack-block-kit-builder/slack-block-kit-builder";

interface TemplateChannelTabProps {
  channel: string;
  templates: NotificationTemplate[];
  onTemplateChange: (id: string, updates: Partial<NotificationTemplate>) => void;
}

export function TemplateChannelTab({
  channel,
  templates,
  onTemplateChange,
}: TemplateChannelTabProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  useEffect(() => {
    if (activeTemplate) {
      setSelectedId(activeTemplate.id);
    } else {
      setSelectedId("");
    }
  }, [channel, templates, activeTemplate]);

  if (!activeTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed border-border rounded-xl bg-card/10">
        <Icon icon="solar:letter-opened-line-duotone" className="size-10 mb-2 opacity-50" />
        <span className="text-sm font-semibold">Không tìm thấy mẫu thông báo nào</span>
      </div>
    );
  }

  const handleInsertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = activeTemplate.content;
    const token = `{{${variable}}}`;
    const newContent = text.substring(0, start) + token + text.substring(end);

    onTemplateChange(activeTemplate.id, { content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  };

  const updateExtraConfig = (key: string, value: any) => {
    onTemplateChange(activeTemplate.id, {
      extraConfig: {
        ...activeTemplate.extraConfig,
        [key]: value,
      },
    });
  };

  const getDiscordEmbeds = (): DiscordEmbed[] => {
    return (activeTemplate.extraConfig?.discordEmbeds || []) as DiscordEmbed[];
  };

  const handleDiscordEmbedsChange = (embeds: DiscordEmbed[]) => {
    onTemplateChange(activeTemplate.id, {
      extraConfig: {
        ...activeTemplate.extraConfig,
        discordEmbeds: embeds,
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <label className="text-xs font-bold text-foreground">Chọn mẫu sự kiện</label>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Chọn mẫu sự kiện..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id} className="text-[13px]">
                {t.name} ({t.eventKey})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card/30! border-border shadow-sm p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-foreground">{activeTemplate.name}</h4>
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-5">
                {activeTemplate.eventKey}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {activeTemplate.target === "admin" ? "Admin" : "Client"}
              </Badge>
            </div>
            {activeTemplate.description && (
              <p className="text-xs text-muted-foreground font-medium">{activeTemplate.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-muted-foreground">Hoạt động</span>
            <Switch
              checked={activeTemplate.isActive}
              onCheckedChange={(checked) => onTemplateChange(activeTemplate.id, { isActive: checked })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {activeTemplate.channel === "email" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Tên người gửi (Sender Name)</label>
                    <Input
                      value={activeTemplate.extraConfig?.senderName || ""}
                      onChange={(e) => updateExtraConfig("senderName", e.target.value)}
                      placeholder="Ví dụ: VaniStudio Support"
                      className="h-10 text-[13px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground">Email người gửi (Sender Email)</label>
                    <Input
                      value={activeTemplate.extraConfig?.senderEmail || ""}
                      onChange={(e) => updateExtraConfig("senderEmail", e.target.value)}
                      placeholder="Ví dụ: support@domain.com"
                      className="h-10 text-[13px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Tiêu đề Email (Subject)</label>
                  <Input
                    value={activeTemplate.subject || ""}
                    onChange={(e) => onTemplateChange(activeTemplate.id, { subject: e.target.value })}
                    placeholder="Nhập tiêu đề email..."
                    className="h-10 text-[13px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Nội dung thông báo (Content Template)</label>
                  <Textarea
                    ref={textareaRef}
                    value={activeTemplate.content}
                    onChange={(e) => onTemplateChange(activeTemplate.id, { content: e.target.value })}
                    placeholder="Nhập nội dung thông báo..."
                    rows={12}
                    className="font-mono text-xs leading-relaxed"
                  />
                </div>
              </>
            )}

            {activeTemplate.channel === "telegram" && (
              <>
                <div className="space-y-2 max-w-[280px]">
                  <label className="text-xs font-bold text-foreground">Định dạng tin nhắn (Parse Mode)</label>
                  <Select
                    value={activeTemplate.extraConfig?.parseMode || "HTML"}
                    onValueChange={(val) => updateExtraConfig("parseMode", val)}
                  >
                    <SelectTrigger className="h-10 text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HTML" className="text-[13px]">HTML Parser</SelectItem>
                      <SelectItem value="Markdown" className="text-[13px]">Markdown Parser</SelectItem>
                      <SelectItem value="MarkdownV2" className="text-[13px]">MarkdownV2 Parser</SelectItem>
                      <SelectItem value="PlainText" className="text-[13px]">Plain Text Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">Nội dung thông báo (Content Template)</label>
                  <Textarea
                    ref={textareaRef}
                    value={activeTemplate.content}
                    onChange={(e) => onTemplateChange(activeTemplate.id, { content: e.target.value })}
                    placeholder="Nhập nội dung thông báo..."
                    rows={12}
                    className="font-mono text-xs leading-relaxed"
                  />
                </div>
              </>
            )}

            {activeTemplate.channel === "discord" && (
              <DiscordEmbedBuilder
                content={activeTemplate.content}
                onContentChange={(content) => onTemplateChange(activeTemplate.id, { content })}
                embeds={getDiscordEmbeds()}
                onEmbedsChange={handleDiscordEmbedsChange}
              />
            )}

            {activeTemplate.channel === "slack" && (
              <SlackBlockBuilder
                blocks={(activeTemplate.extraConfig?.slackBlocks || []) as SlackBlock[]}
                onBlocksChange={(blocks) => updateExtraConfig("slackBlocks", blocks)}
              />
            )}

            {(activeTemplate.channel === "email" || activeTemplate.channel === "telegram") && activeTemplate.variables && activeTemplate.variables.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-foreground">Từ khóa khả dụng (Click để chèn)</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeTemplate.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="secondary"
                      className="cursor-pointer hover:bg-vanixjnk/20 text-xs px-2 py-0.5"
                      onClick={() => handleInsertVariable(variable)}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Giao diện xem trước</span>

            {activeTemplate.channel === "email" && (
              <div className="rounded-lg border border-border bg-card overflow-hidden h-[550px] flex flex-col shadow-sm">
                <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>Xem trước Email</span>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-destructive/60" />
                    <span className="size-2.5 rounded-full bg-amber-500/60" />
                    <span className="size-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                </div>
                <div className="p-4 border-b border-border space-y-2 text-xs bg-card">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-muted-foreground min-w-[60px]">Từ:</span>
                    <span className="text-foreground text-[13px]">
                      {activeTemplate.extraConfig?.senderName || "VaniStudio"} &lt;{activeTemplate.extraConfig?.senderEmail || "noreply@vanistudio.com"}&gt;
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-muted-foreground min-w-[60px]">Tiêu đề:</span>
                    <span className="text-foreground text-[13px] font-semibold">{activeTemplate.subject || "(Không có tiêu đề)"}</span>
                  </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-zinc-950 font-sans text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                  {activeTemplate.content || <span className="text-muted-foreground italic text-xs">Chưa có nội dung...</span>}
                </div>
              </div>
            )}

            {activeTemplate.channel === "telegram" && (
              <TelegramMessagePreview
                message={activeTemplate.content}
              />
            )}

            {activeTemplate.channel === "discord" && (
              <DiscordMessagePreview
                message={activeTemplate.content}
                embeds={getDiscordEmbeds()}
              />
            )}

            {activeTemplate.channel === "slack" && (
              <SlackMessagePreview
                message={activeTemplate.content}
                blocks={(activeTemplate.extraConfig?.slackBlocks || []) as SlackBlock[]}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
