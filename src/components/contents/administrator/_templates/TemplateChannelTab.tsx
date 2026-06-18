"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/animate/tooltip";
import { type NotificationTemplate } from "@/server/db/schemas/template.schema";
import { TelegramRichMessageBuilder, TelegramMessagePreview, type TelegramInlineKeyboard } from "@/components/vanixjnk/telegram-rich-message-builder";
import { DiscordEmbedBuilder, DiscordMessagePreview } from "@/components/vanixjnk/discord-embed-builder";
import { SlackBlockBuilder, SlackMessagePreview } from "@/components/vanixjnk/slack-block-kit-builder";
import type { DiscordEmbed } from "@/components/vanixjnk/discord-embed-builder/discord-embed-builder";
import type { SlackBlock } from "@/components/vanixjnk/slack-block-kit-builder/slack-block-kit-builder";
import { LazySexyEditor } from "@/components/vanixjnk/sexy-editor";
import type { SexyEditorRef } from "@/components/vanixjnk/sexy-editor/sexy-editor";
import { VARIABLE_EXPLANATIONS } from "@/defaults/templates.default";

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
  const editorRef = useRef<SexyEditorRef>(null);

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
    const token = `{{${variable}}}`;
    if (activeTemplate.channel === "email") {
      editorRef.current?.insertContent(token);
      return;
    }
    navigator.clipboard.writeText(token).then(() => {
      toast.success(`Đã sao chép ${token} vào bộ nhớ tạm!`);
    }).catch(() => {});
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

  const getTelegramInlineKeyboard = (): TelegramInlineKeyboard => {
    return (activeTemplate.extraConfig?.telegramInlineKeyboard || { rows: [] }) as TelegramInlineKeyboard;
  };

  const handleTelegramKeyboardChange = (keyboard: TelegramInlineKeyboard) => {
    onTemplateChange(activeTemplate.id, {
      extraConfig: {
        ...activeTemplate.extraConfig,
        telegramInlineKeyboard: keyboard,
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <TooltipProvider>
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-2">
          {templates.map((template) => {
            const isSelected = selectedId === template.id;
            return (
              <Tooltip key={template.id} side="right" sideOffset={12}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedId(template.id)}
                    className={`flex items-start gap-3 w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-vanixjnk/15 border-vanixjnk/25 text-vanixjnk shadow-sm"
                        : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      icon={isSelected ? "solar:folder-open-line-duotone" : "solar:folder-with-files-line-duotone"}
                      className={`size-5 mt-0.5 shrink-0 ${isSelected ? "text-vanixjnk" : ""}`}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0 w-full">
                      <span className={`text-[13px] font-bold whitespace-normal md:whitespace-nowrap md:truncate md:block ${isSelected ? "text-vanixjnk" : "text-foreground"}`}>
                        {template.name}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/80 whitespace-normal md:whitespace-nowrap md:truncate md:block font-mono">
                        {template.eventKey}
                      </span>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="hidden md:flex flex-col gap-0.5 items-start">
                  <span className="font-bold">{template.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{template.eventKey}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      <div className="lg:col-span-8 xl:col-span-9">
        <Card className="bg-card/30! border-border shadow-sm p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-foreground">{activeTemplate.name}</h4>
              <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0 h-5">
                {activeTemplate.eventKey}
              </Badge>
              <Badge
                variant={activeTemplate.target === "admin" ? "danger" : "success"}
                className="text-[10px] px-1.5 py-0 h-5"
              >
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

        <div className="space-y-6">
          {activeTemplate.channel === "email" && (
            <>
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
                <LazySexyEditor
                  ref={editorRef}
                  value={activeTemplate.content}
                  onChange={(val) => onTemplateChange(activeTemplate.id, { content: val })}
                  placeholder="Nhập nội dung email..."
                  isEmail={true}
                  modeType="rich-text"
                />
              </div>
            </>
          )}

          {activeTemplate.channel === "telegram" && (
            <TelegramRichMessageBuilder
              message={activeTemplate.content}
              onMessageChange={(content) => onTemplateChange(activeTemplate.id, { content })}
              inlineKeyboard={getTelegramInlineKeyboard()}
              onKeyboardChange={handleTelegramKeyboardChange}
            />
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

          {activeTemplate.variables && activeTemplate.variables.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <span className="text-xs font-bold text-foreground">Từ khóa khả dụng (Click để chèn)</span>
              <div className="border border-border/80 rounded-xl divide-y divide-border/50 max-h-[300px] overflow-y-auto bg-muted/10">
                {activeTemplate.variables.map((variable) => (
                  <div key={variable} className="flex items-center justify-between gap-4 p-2.5 hover:bg-muted/30 transition-colors">
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-vanixjnk/20 hover:text-vanixjnk text-xs px-2.5 py-1 font-mono shrink-0 transition-colors"
                      onClick={() => handleInsertVariable(variable)}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                    <span className="text-xs text-muted-foreground text-right font-medium">
                      {VARIABLE_EXPLANATIONS[variable] || "Không có giải thích"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {activeTemplate.channel !== "email" && (
          <div className="pt-6 border-t border-border/50 space-y-4">
            <div className="flex items-center gap-2">
              <Icon icon="solar:videocamera-record-line-duotone" className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Giao diện xem trước</span>
            </div>

            {activeTemplate.channel === "telegram" && (
              <TelegramMessagePreview
                message={activeTemplate.content}
                inlineKeyboard={getTelegramInlineKeyboard()}
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
        )}
      </Card>
    </div>
  </div>
  );
}
