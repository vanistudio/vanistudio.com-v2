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
  const [slackJson, setSlackJson] = useState<string>("");
  const [slackJsonError, setSlackJsonError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  useEffect(() => {
    if (activeTemplate) {
      setSelectedId(activeTemplate.id);
    } else {
      setSelectedId("");
    }
  }, [channel, templates, activeTemplate]);

  useEffect(() => {
    if (activeTemplate && activeTemplate.channel === "slack") {
      setSlackJson(JSON.stringify(activeTemplate.extraConfig?.slackBlocks || [], null, 2));
      setSlackJsonError(null);
    }
  }, [selectedId, activeTemplate]);

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

  const handleSlackJsonChange = (val: string) => {
    setSlackJson(val);
    try {
      const parsed = JSON.parse(val);
      if (!Array.isArray(parsed)) {
        throw new Error("Slack blocks phải là một mảng danh sách các blocks");
      }
      setSlackJsonError(null);
      onTemplateChange(activeTemplate.id, {
        extraConfig: {
          ...activeTemplate.extraConfig,
          slackBlocks: parsed,
        },
      });
    } catch (err: any) {
      setSlackJsonError(err.message || "Định dạng JSON không hợp lệ");
    }
  };

  const updateExtraConfig = (key: string, value: any) => {
    onTemplateChange(activeTemplate.id, {
      extraConfig: {
        ...activeTemplate.extraConfig,
        [key]: value,
      },
    });
  };

  const updateDiscordEmbed = (key: string, value: any) => {
    const embed = activeTemplate.extraConfig?.discordEmbed || {};
    onTemplateChange(activeTemplate.id, {
      extraConfig: {
        ...activeTemplate.extraConfig,
        discordEmbed: {
          ...embed,
          [key]: value,
        },
      },
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

        {activeTemplate.channel === "email" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        )}

        {activeTemplate.channel === "telegram" && (
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
        )}

        {activeTemplate.channel === "discord" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Màu Embed (Hex Code)</label>
              <Input
                value={activeTemplate.extraConfig?.discordEmbed?.color || "#7c3aed"}
                onChange={(e) => updateDiscordEmbed("color", e.target.value)}
                placeholder="#7c3aed"
                className="h-10 text-[13px] font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Tiêu đề Embed</label>
              <Input
                value={activeTemplate.extraConfig?.discordEmbed?.title || ""}
                onChange={(e) => updateDiscordEmbed("title", e.target.value)}
                placeholder="Nhập tiêu đề Embed..."
                className="h-10 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Tên tác giả (Author Name)</label>
              <Input
                value={activeTemplate.extraConfig?.discordEmbed?.authorName || ""}
                onChange={(e) => updateDiscordEmbed("authorName", e.target.value)}
                placeholder="Nhập tên tác giả..."
                className="h-10 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Icon tác giả URL</label>
              <Input
                value={activeTemplate.extraConfig?.discordEmbed?.authorIcon || ""}
                onChange={(e) => updateDiscordEmbed("authorIcon", e.target.value)}
                placeholder="URL hình ảnh icon..."
                className="h-10 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Chữ chân trang (Footer Text)</label>
              <Input
                value={activeTemplate.extraConfig?.discordEmbed?.footerText || ""}
                onChange={(e) => updateDiscordEmbed("footerText", e.target.value)}
                placeholder="Nhập chữ chân trang..."
                className="h-10 text-[13px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Ảnh Thumbnail URL</label>
              <Input
                value={activeTemplate.extraConfig?.discordEmbed?.thumbnailUrl || ""}
                onChange={(e) => updateDiscordEmbed("thumbnailUrl", e.target.value)}
                placeholder="URL hình ảnh thu nhỏ..."
                className="h-10 text-[13px]"
              />
            </div>
          </div>
        )}

        {activeTemplate.channel === "email" && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">Tiêu đề Email (Subject)</label>
            <Input
              value={activeTemplate.subject || ""}
              onChange={(e) => onTemplateChange(activeTemplate.id, { subject: e.target.value })}
              placeholder="Nhập tiêu đề email..."
              className="h-10 text-[13px]"
            />
          </div>
        )}

        {activeTemplate.channel === "slack" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Icon icon="solar:code-square-line-duotone" className="size-4 text-muted-foreground" />
                Cấu hình Slack Blocks (JSON Block Kit)
              </label>
              {slackJsonError && (
                <span className="text-[10px] text-destructive font-bold">{slackJsonError}</span>
              )}
            </div>
            <Textarea
              value={slackJson}
              onChange={(e) => handleSlackJsonChange(e.target.value)}
              placeholder={`[\n  {\n    "type": "section",\n    "text": { ... }\n  }\n]`}
              rows={8}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">Sử dụng định dạng mảng cấu trúc JSON Blocks của Slack.</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Nội dung thông báo (Content Template)</label>
          <Textarea
            ref={textareaRef}
            value={activeTemplate.content}
            onChange={(e) => onTemplateChange(activeTemplate.id, { content: e.target.value })}
            placeholder="Nhập nội dung thông báo..."
            rows={10}
            className="font-mono text-xs leading-relaxed"
          />
        </div>

        {activeTemplate.variables && activeTemplate.variables.length > 0 && (
          <div className="space-y-2">
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
      </Card>
    </div>
  );
}
