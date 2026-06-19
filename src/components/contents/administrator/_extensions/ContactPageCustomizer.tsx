"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  type ContactPageCustomizerConfig,
  type ContactFieldItem,
  type CustomFieldItem,
} from "@/defaults/extension.default";

interface Props {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  config: ContactPageCustomizerConfig;
  onConfigChange: (config: Partial<ContactPageCustomizerConfig>) => void;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Họ và tên",
  email: "Địa chỉ Email",
  phone: "Số điện thoại",
  company: "Tên công ty",
  subject: "Tiêu đề liên hệ",
  message: "Nội dung lời nhắn",
};

const SOCIAL_LABELS: Record<string, { name: string; icon: string }> = {
  address: { name: "Trụ sở chính (Địa chỉ)", icon: "solar:map-point-line-duotone" },
  phone: { name: "Hotline hỗ trợ", icon: "solar:phone-calling-line-duotone" },
  email: { name: "Email liên hệ", icon: "solar:letter-line-duotone" },
  zalo: { name: "Zalo Chat (Link)", icon: "solar:chat-round-dots-line-duotone" },
  facebook: { name: "Facebook Fanpage (Link)", icon: "solar:globus-line-duotone" },
  workingHours: { name: "Thời gian làm việc", icon: "solar:clock-square-line-duotone" },
};

export default function ContactPageCustomizer({
  isEnabled,
  onEnabledChange,
  config,
  onConfigChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<"fields" | "social" | "ui">("fields");
  const [editingCustomField, setEditingCustomField] = useState<Partial<CustomFieldItem> | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [searchMapQuery, setSearchMapQuery] = useState("");
  const [mapPreviewUrl, setMapPreviewUrl] = useState("");

  const fields = config.fields || {};

  const handleMapValueChange = (val: string) => {
    const iframeSrcMatch = val.match(/src=["'](https:[^"']+)["']/i);
    const cleaned = iframeSrcMatch && iframeSrcMatch[1] ? iframeSrcMatch[1] : val.trim();
    handleSocialChange("mapEmbedUrl", "value", cleaned);
  };

  const handleSearchMap = () => {
    if (!searchMapQuery.trim()) return;
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(searchMapQuery.trim())}&output=embed`;
    setMapPreviewUrl(url);
  };

  const handleApplyMap = () => {
    if (mapPreviewUrl) {
      handleSocialChange("mapEmbedUrl", "value", mapPreviewUrl);
      setIsMapDialogOpen(false);
    }
  };
  const socialChannels = config.socialChannels || {};
  const destination = config.destination || { saveToDb: true, useCentralNotification: true };
  const uiConfig = config.uiConfig || {};

  const handleFieldToggle = (fieldKey: string, prop: "show" | "required", val: boolean) => {
    onConfigChange({
      fields: {
        ...fields,
        [fieldKey]: {
          ...fields[fieldKey as keyof typeof fields],
          [prop]: val,
        },
      },
    });
  };

  const handleFieldTextChange = (fieldKey: string, prop: "label" | "placeholder", val: string) => {
    onConfigChange({
      fields: {
        ...fields,
        [fieldKey]: {
          ...fields[fieldKey as keyof typeof fields],
          [prop]: val,
        },
      },
    });
  };

  const handleAttachmentsChange = (prop: string, val: any) => {
    onConfigChange({
      fields: {
        ...fields,
        attachments: {
          ...(fields.attachments || { show: false, required: false, label: "Đính kèm", type: "file", maxFiles: 3, maxSizeMb: 5, allowedExtensions: [] }),
          [prop]: val,
        },
      },
    });
  };

  const handleSocialChange = (key: string, prop: "show" | "value" | "label" | "mapUrl" | "height", val: any) => {
    onConfigChange({
      socialChannels: {
        ...socialChannels,
        [key]: {
          ...(socialChannels[key as keyof typeof socialChannels] || {}),
          [prop]: val,
        },
      },
    });
  };

  const handleUiConfigChange = (key: string, val: any) => {
    onConfigChange({
      uiConfig: {
        ...uiConfig,
        [key]: val,
      },
    });
  };

  const handleDestinationChange = (key: "saveToDb" | "useCentralNotification", val: boolean) => {
    onConfigChange({
      destination: {
        ...destination,
        [key]: val,
      },
    });
  };

  const handleSaveCustomField = () => {
    if (!editingCustomField) return;
    const current = fields.customFields || [];
    const isNew = !editingCustomField.key;
    const key = editingCustomField.key || `custom_${Date.now()}`;

    const formatted: CustomFieldItem = {
      key,
      show: editingCustomField.show ?? true,
      required: editingCustomField.required ?? false,
      label: editingCustomField.label || "Trường mới",
      placeholder: editingCustomField.placeholder || "",
      type: editingCustomField.type || "text",
      options: editingCustomField.options || [],
    };

    let nextList = [...current];
    if (isNew) {
      nextList.push(formatted);
    } else {
      nextList = nextList.map((f) => (f.key === key ? formatted : f));
    }

    onConfigChange({
      fields: {
        ...fields,
        customFields: nextList,
      },
    });
    setEditingCustomField(null);
  };

  const handleDeleteCustomField = (key: string) => {
    const current = fields.customFields || [];
    onConfigChange({
      fields: {
        ...fields,
        customFields: current.filter((f) => f.key !== key),
      },
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <Card className="bg-card/30! border-border shadow-sm p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Icon icon="solar:letter-line-duotone" className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-base text-foreground leading-none">Trang Liên Hệ & Phản Hồi</h3>
            <p className="text-[13px] text-muted-foreground font-medium">Bật cấu hình tùy biến trang liên hệ trên website.</p>
          </div>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onEnabledChange} />
      </Card>

      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === "fields" ? "vanixjnk" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("fields")}
          className="text-xs font-bold"
        >
          <Icon icon="solar:document-text-line-duotone" className="mr-1.5 size-4" />
          Trường Dữ Liệu
        </Button>
        <Button
          variant={activeTab === "social" ? "vanixjnk" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("social")}
          className="text-xs font-bold"
        >
          <Icon icon="solar:users-group-two-rounded-line-duotone" className="mr-1.5 size-4" />
          Kênh Liên Hệ
        </Button>
        <Button
          variant={activeTab === "ui" ? "vanixjnk" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("ui")}
          className="text-xs font-bold"
        >
          <Icon icon="solar:palette-line-duotone" className="mr-1.5 size-4" />
          Giao Diện & Đích Nhận
        </Button>
      </div>

      {activeTab === "fields" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(FIELD_LABELS).map((fieldKey) => {
              const fieldVal = fields[fieldKey as keyof typeof fields] as ContactFieldItem;
              if (!fieldVal) return null;
              return (
                <Card key={fieldKey} className="bg-card/30! border-border shadow-sm p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{FIELD_LABELS[fieldKey]}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground">Hiển thị</span>
                        <Switch
                          checked={fieldVal.show}
                          onCheckedChange={(checked) => handleFieldToggle(fieldKey, "show", checked)}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground">Bắt buộc</span>
                        <Switch
                          checked={fieldVal.required}
                          onCheckedChange={(checked) => handleFieldToggle(fieldKey, "required", checked)}
                          disabled={!fieldVal.show}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground">Tiêu đề trường</label>
                      <Input
                        value={fieldVal.label}
                        onChange={(e) => handleFieldTextChange(fieldKey, "label", e.target.value)}
                        placeholder="Nhãn hiển thị..."
                        className="h-8 text-xs"
                        disabled={!fieldVal.show}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground">Placeholder gợi ý</label>
                      <Input
                        value={fieldVal.placeholder || ""}
                        onChange={(e) => handleFieldTextChange(fieldKey, "placeholder", e.target.value)}
                        placeholder="Nhập placeholder..."
                        className="h-8 text-xs"
                        disabled={!fieldVal.show}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}

            {fields.attachments && (
              <Card className="bg-card/30! border-border shadow-sm p-4 flex flex-col gap-3 col-span-1 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:paperclip-line-duotone" className="size-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">File đính kèm (Attachments)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground">Hiển thị</span>
                      <Switch
                        checked={fields.attachments.show}
                        onCheckedChange={(checked) => handleAttachmentsChange("show", checked)}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground">Bắt buộc</span>
                      <Switch
                        checked={fields.attachments.required}
                        onCheckedChange={(checked) => handleAttachmentsChange("required", checked)}
                        disabled={!fields.attachments.show}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-muted-foreground">Nhãn hiển thị</label>
                    <Input
                      value={fields.attachments.label}
                      onChange={(e) => handleAttachmentsChange("label", e.target.value)}
                      placeholder="Chọn tài liệu đính kèm..."
                      className="h-8 text-xs"
                      disabled={!fields.attachments.show}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground">Số file tối đa</label>
                    <Input
                      type="number"
                      value={fields.attachments.maxFiles || 3}
                      onChange={(e) => handleAttachmentsChange("maxFiles", Number(e.target.value))}
                      className="h-8 text-xs"
                      disabled={!fields.attachments.show}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground">Dung lượng tối đa (MB)</label>
                    <Input
                      type="number"
                      value={fields.attachments.maxSizeMb || 5}
                      onChange={(e) => handleAttachmentsChange("maxSizeMb", Number(e.target.value))}
                    className="h-8 text-xs"
                    disabled={!fields.attachments.show}
                  />
                </div>
              </div>
            </Card>
          )}
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex justify-between items-center pb-2 border-b border-border/60">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Trường Dữ Liệu Tự Định Nghĩa (Custom Fields)</span>
                <span className="text-xs text-muted-foreground">Thiết lập thêm các trường nhập liệu động trên Form liên hệ.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditingCustomField({
                    label: "",
                    placeholder: "",
                    type: "text",
                    show: true,
                    required: false,
                    options: [],
                  })
                }
                className="h-8 text-xs font-semibold"
              >
                <Icon icon="solar:add-circle-line-duotone" className="mr-1.5 size-4" />
                Thêm trường tự chọn
              </Button>
            </div>

            {(!fields.customFields || fields.customFields.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border border-dashed border-border/80 rounded-xl bg-muted/5">
                <Icon icon="solar:slider-line-duotone" className="size-8 opacity-40 mb-1.5" />
                <span className="text-xs font-medium">Chưa cấu hình trường dữ liệu tự định nghĩa nào</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {fields.customFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center justify-between p-3.5 border border-border/70 rounded-xl hover:bg-muted/10 transition-all bg-card/30!"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        <Icon icon="solar:case-minimalistic-line-duotone" className="size-5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground truncate">{field.label}</span>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 uppercase font-mono">
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge className="text-[9px] px-1.5 py-0 h-4 bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              Bắt buộc
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          Placeholder: "{field.placeholder || 'Không có'}"
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCustomField(field)}
                        className="size-8 rounded-lg hover:bg-muted"
                      >
                        <Icon icon="solar:pen-line-duotone" className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCustomField(field.key)}
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
        </div>
      )}

      {activeTab === "social" && (
        <div className="grid grid-cols-1 gap-4">
          {Object.keys(SOCIAL_LABELS).map((socialKey) => {
            const socialVal = socialChannels[socialKey as keyof typeof socialChannels] as {
              show: boolean;
              value: string;
              label: string;
            };
            if (!socialVal) return null;
            return (
              <Card key={socialKey} className="bg-card/30! border-border shadow-sm p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                      <Icon icon={SOCIAL_LABELS[socialKey].icon} className="size-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{SOCIAL_LABELS[socialKey].name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground">Hiển thị</span>
                    <Switch
                      checked={socialVal.show}
                      onCheckedChange={(checked) => handleSocialChange(socialKey, "show", checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground">Nhãn hiển thị</label>
                    <Input
                      value={socialVal.label}
                      onChange={(e) => handleSocialChange(socialKey, "label", e.target.value)}
                      placeholder="Ví dụ: Hotline hỗ trợ..."
                      className="h-8.5 text-xs"
                      disabled={!socialVal.show}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground">Giá trị nhập</label>
                    <Input
                      value={socialVal.value}
                      onChange={(e) => handleSocialChange(socialKey, "value", e.target.value)}
                      placeholder="Giá trị liên lạc..."
                      className="h-8.5 text-xs"
                      disabled={!socialVal.show}
                    />
                  </div>
                </div>
              </Card>
            );
          })}

          {socialChannels.mapEmbedUrl && (
            <Card className="bg-card/30! border-border shadow-sm p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Icon icon="solar:map-arrow-square-line-duotone" className="size-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Bản đồ nhúng Google Map (iframe URL)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground">Hiển thị</span>
                  <Switch
                    checked={socialChannels.mapEmbedUrl.show}
                    onCheckedChange={(checked) => handleSocialChange("mapEmbedUrl", "show", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-1">
                <div className="flex flex-col gap-1.5 sm:col-span-10">
                  <label className="text-[10px] font-bold text-muted-foreground">Đường dẫn Iframe Google Maps</label>
                  <div className="flex gap-2">
                    <Input
                      value={socialChannels.mapEmbedUrl.value}
                      onChange={(e) => handleMapValueChange(e.target.value)}
                      placeholder="Dán mã nhúng iframe hoặc đường dẫn Google Maps..."
                      className="h-8.5 text-xs flex-1"
                      disabled={!socialChannels.mapEmbedUrl.show}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchMapQuery("");
                        setMapPreviewUrl(socialChannels.mapEmbedUrl.value || "");
                        setIsMapDialogOpen(true);
                      }}
                      className="h-8.5 shrink-0 px-3 font-semibold text-xs border-dashed border-primary/30"
                      disabled={!socialChannels.mapEmbedUrl.show}
                    >
                      <Icon icon="solar:map-point-line-duotone" className="size-4 mr-1 text-primary" />
                      Tìm & Xem Bản Đồ
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-[10px] font-bold text-muted-foreground">Chiều cao (px)</label>
                  <Input
                    type="number"
                    value={socialChannels.mapEmbedUrl.height}
                    onChange={(e) => handleSocialChange("mapEmbedUrl", "height", Number(e.target.value))}
                    className="h-8.5 text-xs"
                    disabled={!socialChannels.mapEmbedUrl.show}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "ui" && (
        <div className="flex flex-col gap-6">
          <Card className="bg-card/30! border-border shadow-sm p-4 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/50">Cơ chế lưu trữ & Thông báo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 border border-border/60 rounded-xl bg-background">
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold">Lưu phản hồi vào Database</span>
                  <span className="text-[10px] text-muted-foreground">Lưu các thư liên hệ của khách hàng vào danh sách hỗ trợ</span>
                </div>
                <Switch
                  checked={destination.saveToDb}
                  onCheckedChange={(checked) => handleDestinationChange("saveToDb", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 border border-border/60 rounded-xl bg-background">
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold">Kết nối Thông báo Trung tâm</span>
                  <span className="text-[10px] text-muted-foreground">Kích hoạt đẩy tin qua SMTP và chat bot trung tâm (recommened)</span>
                </div>
                <Switch
                  checked={destination.useCentralNotification}
                  onCheckedChange={(checked) => handleDestinationChange("useCentralNotification", checked)}
                />
              </div>
            </div>
          </Card>

          <Card className="bg-card/30! border-border shadow-sm p-4 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-foreground pb-2 border-b border-border/50">Cấu hình UI & Nội dung Form</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Tiêu đề lớn Trang liên hệ</label>
                <Input
                  value={uiConfig.title || ""}
                  onChange={(e) => handleUiConfigChange("title", e.target.value)}
                  placeholder="Ví dụ: Liên hệ với chúng tôi"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Mô tả chi tiết dưới tiêu đề</label>
                <Input
                  value={uiConfig.description || ""}
                  onChange={(e) => handleUiConfigChange("description", e.target.value)}
                  placeholder="Gợi ý thêm thông tin liên lạc..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Nút Gửi (Mặc định)</label>
                <Input
                  value={uiConfig.submitButtonText || ""}
                  onChange={(e) => handleUiConfigChange("submitButtonText", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Nút Gửi (Đang tải...)</label>
                <Input
                  value={uiConfig.loadingButtonText || ""}
                  onChange={(e) => handleUiConfigChange("loadingButtonText", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Tiêu đề thông báo gửi thành công</label>
                <Input
                  value={uiConfig.successTitle || ""}
                  onChange={(e) => handleUiConfigChange("successTitle", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Nội dung thông báo gửi thành công</label>
                <Input
                  value={uiConfig.successMessage || ""}
                  onChange={(e) => handleUiConfigChange("successMessage", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Layout hiển thị trang liên hệ</label>
                <Select
                  value={uiConfig.layout || "split_form_left"}
                  onValueChange={(val) => handleUiConfigChange("layout", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn Layout..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split_form_left">Bên trái: Form • Bên phải: Thông tin</SelectItem>
                    <SelectItem value="split_form_right">Bên trái: Thông tin • Bên phải: Form</SelectItem>
                    <SelectItem value="centered_card">Dạng thẻ căn giữa trang</SelectItem>
                    <SelectItem value="full_width">Bố cục chiều rộng đầy đủ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Sheet open={!!editingCustomField} onOpenChange={(open) => !open && setEditingCustomField(null)}>
        <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6 pb-2">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:add-circle-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              {editingCustomField?.key ? "Cấu hình trường dữ liệu" : "Thêm trường dữ liệu mới"}
            </SheetTitle>
            <SheetDescription>Khai báo loại, tiêu đề, placeholder và trạng thái bắt buộc.</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-foreground">Loại trường dữ liệu (Type)</label>
              <Select
                value={editingCustomField?.type || "text"}
                onValueChange={(val) => setEditingCustomField({ ...editingCustomField, type: val as any })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại trường..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Dòng văn bản ngắn (Text)</SelectItem>
                  <SelectItem value="email">Địa chỉ Email</SelectItem>
                  <SelectItem value="tel">Số điện thoại (Tel)</SelectItem>
                  <SelectItem value="textarea">Văn bản dài (Textarea)</SelectItem>
                  <SelectItem value="select">Danh sách chọn (Select Dropdown)</SelectItem>
                  <SelectItem value="file">Tải tệp tin đính kèm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-foreground">Tiêu đề nhãn hiển thị</label>
              <Input
                placeholder="Ví dụ: Tên tổ chức/công ty..."
                value={editingCustomField?.label || ""}
                onChange={(e) => setEditingCustomField({ ...editingCustomField, label: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-foreground">Placeholder hướng dẫn nhập</label>
              <Input
                placeholder="Nhập placeholder..."
                value={editingCustomField?.placeholder || ""}
                onChange={(e) => setEditingCustomField({ ...editingCustomField, placeholder: e.target.value })}
              />
            </div>

            {editingCustomField?.type === "select" && (
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-foreground">Tùy chọn danh sách (ngăn cách bởi dấu phẩy)</label>
                <Input
                  placeholder="Ví dụ: Lựa chọn 1, Lựa chọn 2, Lựa chọn 3"
                  value={editingCustomField?.options?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingCustomField({
                      ...editingCustomField,
                      options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-t border-b border-border/40">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold">Kích hoạt hiển thị</span>
                <span className="text-[10px] text-muted-foreground">Hiện hoặc ẩn trường này trên Form</span>
              </div>
              <Switch
                checked={editingCustomField?.show ?? true}
                onCheckedChange={(checked) => setEditingCustomField({ ...editingCustomField, show: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/40">
              <div className="flex flex-col">
                <span className="text-[12px] font-bold">Trường bắt buộc (Required)</span>
                <span className="text-[10px] text-muted-foreground">Người dùng bắt buộc phải nhập dữ liệu</span>
              </div>
              <Switch
                checked={editingCustomField?.required ?? false}
                onCheckedChange={(checked) => setEditingCustomField({ ...editingCustomField, required: checked })}
                disabled={!(editingCustomField?.show ?? true)}
              />
            </div>
          </div>

          <div className="p-6">
            <Button variant="vanixjnk" className="w-full font-bold text-sm" onClick={handleSaveCustomField}>
              <Icon icon="solar:check-circle-line-duotone" className="size-5 mr-2" />
              Lưu thay đổi trường dữ liệu
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="sm:max-w-[800px] w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Chọn Bản đồ Google Map</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Nhập địa chỉ cần hiển thị</label>
              <div className="flex gap-2">
                <Input
                  value={searchMapQuery}
                  onChange={(e) => setSearchMapQuery(e.target.value)}
                  placeholder="Ví dụ: 123 Đường Tôn Đức Thắng, Quận 1, TP. HCM"
                  className="h-9 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchMap();
                    }
                  }}
                />
                <Button
                  onClick={handleSearchMap}
                  variant={"vanixjnk"}
                  className="h-9 px-4"
                >
                  Tìm Vị Trí
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground">Bản đồ xem trước (Live Preview)</label>
              <div className="border border-border rounded-xl overflow-hidden aspect-video bg-muted/20 flex items-center justify-center relative">
                {mapPreviewUrl ? (
                  <iframe
                    src={mapPreviewUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center p-4 text-muted-foreground flex flex-col items-center">
                    <Icon icon="solar:map-point-line-duotone" className="size-8 opacity-40 mb-2" />
                    <span className="text-xs">Chưa có vị trí xem trước. Vui lòng nhập địa chỉ ở trên và nhấn Tìm Vị Trí.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMapDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="vanixjnk"
              size="sm"
              onClick={handleApplyMap}
              disabled={!mapPreviewUrl}
            >
              Áp dụng bản đồ này
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
