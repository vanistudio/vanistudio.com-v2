"use client";

import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  isEnabled: boolean;
  config: {
    fields: {
      name: { show: boolean; required: boolean; label: string; placeholder?: string };
      email: { show: boolean; required: boolean; label: string; placeholder?: string };
      phone: { show: boolean; required: boolean; label: string; placeholder?: string };
      company: { show: boolean; required: boolean; label: string; placeholder?: string };
      subject: { show: boolean; required: boolean; label: string; placeholder?: string };
      message: { show: boolean; required: boolean; label: string; placeholder?: string };
      attachments?: {
        show: boolean;
        required: boolean;
        label: string;
        maxFiles: number;
        maxSizeMb: number;
        allowedExtensions: string[];
      };
      customFields?: Array<{
        key: string;
        show: boolean;
        required: boolean;
        label: string;
        placeholder?: string;
        type: "text" | "email" | "tel" | "textarea" | "select" | "file";
        options?: string[];
      }>;
    };
    socialChannels: {
      address?: { show: boolean; value: string; label: string; icon: string };
      phone?: { show: boolean; value: string; label: string; icon: string };
      email?: { show: boolean; value: string; label: string; icon: string };
      zalo?: { show: boolean; value: string; label: string; icon: string };
      facebook?: { show: boolean; value: string; label: string; icon: string };
      mapEmbedUrl?: { show: boolean; value: string; height: number };
      workingHours?: { show: boolean; value: string; label: string; icon: string };
    };
    destination?: {
      saveToDb: boolean;
      useCentralNotification: boolean;
    };
    uiConfig: {
      title?: string;
      description?: string;
      submitButtonText?: string;
      loadingButtonText?: string;
      successTitle?: string;
      successMessage?: string;
      layout?: "split_form_left" | "split_form_right" | "centered_card" | "full_width";
    };
  };
}

export default function PubContactForm({ isEnabled, config }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  const [attachments, setAttachments] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitMutation = trpc.contact.submit.useMutation();

  if (!isEnabled) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <div className="size-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
          <Icon icon="solar:lock-keyhole-line-duotone" className="text-3xl" />
        </div>
        <h3 className="font-bold text-xl text-foreground">Kênh liên hệ tạm đóng</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          Hệ thống tiếp nhận phản hồi hiện tại đang được bảo trì hoặc tạm ngưng. Vui lòng quay lại sau hoặc liên hệ trực tiếp qua email hỗ trợ của chúng tôi.
        </p>
        <Link href="/" className="mt-6">
          <Button variant="outline" size="sm" className="font-bold text-xs">
            Quay lại trang chủ
          </Button>
        </Link>
      </div>
    );
  }

  const fields = config.fields || {};
  const socialChannels = config.socialChannels || {};
  const uiConfig = config.uiConfig || {};
  const layout = uiConfig.layout || "split_form_left";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCustom = false, customKey = "") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const loadingToast = toast.loading("Đang tải file lên...");

    try {
      const uploadedUrls: string[] = [];
      const limit = isCustom ? 1 : (fields.attachments?.maxFiles || 3);
      const maxSize = (isCustom ? 5 : (fields.attachments?.maxSizeMb || 5)) * 1024 * 1024;
      const allowed = isCustom ? [] : (fields.attachments?.allowedExtensions || []);

      for (let i = 0; i < Math.min(files.length, limit); i++) {
        const file = files[i];

        if (file.size > maxSize) {
          toast.error(`File ${file.name} vượt quá dung lượng cho phép.`);
          continue;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        if (allowed.length > 0 && !allowed.includes(ext)) {
          toast.error(`Định dạng file ${ext} không được hỗ trợ.`);
          continue;
        }

        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          throw new Error("Upload thất bại");
        }

        const data = await res.json();
        if (data.success && data.data?.url) {
          uploadedUrls.push(data.data.url);
        }
      }

      if (isCustom && customKey) {
        handleCustomFieldChange(customKey, uploadedUrls[0] || "");
      } else {
        setAttachments((prev) => [...prev, ...uploadedUrls]);
      }
      toast.success("Tải file lên thành công");
    } catch {
      toast.error("Có lỗi xảy ra trong quá trình tải file");
    } finally {
      setIsUploading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fields.name.show && fields.name.required && !formData.name.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }
    if (fields.email.show && fields.email.required && !formData.email.trim()) {
      toast.error("Vui lòng nhập địa chỉ email");
      return;
    }
    if (fields.subject.show && fields.subject.required && !formData.subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (fields.message.show && fields.message.required && !formData.message.trim()) {
      toast.error("Vui lòng nhập nội dung liên hệ");
      return;
    }

    if (fields.customFields) {
      for (const field of fields.customFields) {
        if (field.show && field.required && !customFields[field.key]) {
          toast.error(`Vui lòng nhập/chọn trường: ${field.label}`);
          return;
        }
      }
    }

    try {
      await submitMutation.mutateAsync({
        ...formData,
        attachments,
        customFields,
      });
      setIsSubmitted(true);
      toast.success("Gửi yêu cầu liên hệ thành công!");
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại sau");
    }
  };

  const renderFormFields = () => {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(fields.name.show || fields.email.show || fields.phone.show || fields.company.show) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.name.show && (
              <div className={cn("flex flex-col gap-1.5", !fields.email.show && "md:col-span-2")}>
                <label className="text-xs font-bold text-foreground">
                  {fields.name.label} {fields.name.required && <span className="text-rose-500">*</span>}
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={fields.name.placeholder}
                  required={fields.name.required}
                  className="h-10 text-xs"
                />
              </div>
            )}

            {fields.email.show && (
              <div className={cn("flex flex-col gap-1.5", !fields.name.show && "md:col-span-2")}>
                <label className="text-xs font-bold text-foreground">
                  {fields.email.label} {fields.email.required && <span className="text-rose-500">*</span>}
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={fields.email.placeholder}
                  required={fields.email.required}
                  className="h-10 text-xs"
                />
              </div>
            )}

            {fields.phone.show && (
              <div className={cn("flex flex-col gap-1.5", !fields.company.show && "md:col-span-2")}>
                <label className="text-xs font-bold text-foreground">
                  {fields.phone.label} {fields.phone.required && <span className="text-rose-500">*</span>}
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={fields.phone.placeholder}
                  required={fields.phone.required}
                  className="h-10 text-xs"
                />
              </div>
            )}

            {fields.company.show && (
              <div className={cn("flex flex-col gap-1.5", !fields.phone.show && "md:col-span-2")}>
                <label className="text-xs font-bold text-foreground">
                  {fields.company.label} {fields.company.required && <span className="text-rose-500">*</span>}
                </label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder={fields.company.placeholder}
                  required={fields.company.required}
                  className="h-10 text-xs"
                />
              </div>
            )}
          </div>
        )}

        {fields.subject.show && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">
              {fields.subject.label} {fields.subject.required && <span className="text-rose-500">*</span>}
            </label>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder={fields.subject.placeholder}
              required={fields.subject.required}
              className="h-10 text-xs"
            />
          </div>
        )}

        {fields.message.show && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-foreground">
              {fields.message.label} {fields.message.required && <span className="text-rose-500">*</span>}
            </label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={fields.message.placeholder}
              required={fields.message.required}
              rows={5}
              className="text-xs resize-none"
            />
          </div>
        )}

        {fields.customFields && fields.customFields.map((field) => {
          if (!field.show) return null;
          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-foreground">
                {field.label} {field.required && <span className="text-rose-500">*</span>}
              </label>

              {field.type === "textarea" ? (
                <Textarea
                  value={customFields[field.key] || ""}
                  onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  className="text-xs resize-none"
                />
              ) : field.type === "select" ? (
                <select
                  value={customFields[field.key] || ""}
                  onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                  required={field.required}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">{field.placeholder || "Chọn một tùy chọn..."}</option>
                  {field.options?.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === "file" ? (
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    onChange={(e) => handleFileUpload(e, true, field.key)}
                    required={field.required}
                    className="text-xs h-10 py-1.5"
                  />
                  {customFields[field.key] && (
                    <span className="text-[10px] text-green-500 truncate">
                      Đã chọn: <a href={customFields[field.key]} target="_blank" className="underline">{customFields[field.key]}</a>
                    </span>
                  )}
                </div>
              ) : (
                <Input
                  type={field.type}
                  value={customFields[field.key] || ""}
                  onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="h-10 text-xs"
                />
              )}
            </div>
          );
        })}

        {fields.attachments?.show && (
          <div className="flex flex-col gap-1.5 border border-dashed border-border rounded-xl p-4 bg-muted/5">
            <label className="text-xs font-bold text-foreground flex items-center gap-2">
              <Icon icon="solar:paperclip-line-duotone" className="size-4 text-primary animate-pulse" />
              {fields.attachments.label} {fields.attachments.required && <span className="text-rose-500">*</span>}
            </label>
            <Input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e, false)}
              required={fields.attachments.required && attachments.length === 0}
              className="text-xs h-10 py-1.5 cursor-pointer"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5">
              Cho phép tối đa {fields.attachments.maxFiles} tệp, tối đa {fields.attachments.maxSizeMb} MB/tệp. Định dạng: {fields.attachments.allowedExtensions.join(", ")}
            </span>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-bold">
                    <span className="truncate max-w-[150px]">File #{idx + 1}</span>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="hover:text-rose-500 ml-1">
                      <Icon icon="solar:close-circle-line-duotone" className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="vanixjnk"
          disabled={submitMutation.isPending || isUploading}
          className="w-full h-11 font-bold text-sm mt-2 shrink-0"
        >
          {submitMutation.isPending ? (
            <>
              <Icon icon="solar:restart-line-duotone" className="animate-spin size-5 mr-2" />
              {uiConfig.loadingButtonText || "Đang gửi thông tin..."}
            </>
          ) : (
            <>
              <Icon icon="solar:unread-chat-line-duotone" className="size-5 mr-2" />
              {uiConfig.submitButtonText || "Gửi tin nhắn liên hệ"}
            </>
          )}
        </Button>
      </form>
    );
  };

  const renderSocialInfo = () => {
    return (
      <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col gap-3.5">
          {Object.keys(socialChannels).map((key) => {
            const chan = socialChannels[key as keyof typeof socialChannels] as any;
            if (!chan || !chan.show || key === "mapEmbedUrl") return null;
            return (
              <div key={key} className="flex items-start gap-3.5 p-4 border border-border bg-card/40 rounded-2xl hover:shadow-sm transition-all duration-300">
                <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon icon={chan.icon || "solar:arrow-right-linear"} className="text-xl" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{chan.label}</span>
                  {chan.value.startsWith("http") ? (
                    <a href={chan.value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline truncate">
                      {chan.value.replace("https://", "").replace("www.", "")}
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-foreground">{chan.value}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {socialChannels.mapEmbedUrl?.show && socialChannels.mapEmbedUrl?.value && (
          <div className="w-full border border-border rounded-3xl overflow-hidden aspect-video bg-muted/10 relative shadow-sm">
            <iframe
              src={socialChannels.mapEmbedUrl.value}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: socialChannels.mapEmbedUrl.height || 250 }}
              allowFullScreen={false}
              loading="lazy"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[100px] pb-6 px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0 p-3">
              <Icon icon="solar:letter-line-duotone" className="text-3xl" />
            </div>
            <div className="flex flex-col items-center gap-1.5 max-w-xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{uiConfig.title || "Liên hệ với chúng tôi"}</h1>
              <p className="text-sm text-muted-foreground">
                {uiConfig.description || "Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ giải đáp các thắc mắc của bạn."}
              </p>
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
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 sm:p-8">
          {isSubmitted ? (
            <div className="w-full max-w-xl mx-auto py-12 flex flex-col items-center text-center gap-5">
              <div className="size-20 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center shrink-0 animate-bounce shadow-inner">
                <Icon icon="solar:check-circle-line-duotone" className="text-5xl" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-2xl text-foreground">{uiConfig.successTitle || "Gửi thành công!"}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {uiConfig.successMessage || "Cảm ơn bạn đã gửi liên hệ. Chúng tôi đã nhận được thông tin và sẽ liên lạc lại trong thời gian sớm nhất."}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" });
                    setAttachments([]);
                    setCustomFields({});
                    setIsSubmitted(false);
                  }}
                  className="font-bold text-xs"
                >
                  Gửi thêm thư mới
                </Button>
                <Link href="/">
                  <Button variant="vanixjnk" size="sm" className="font-bold text-xs">
                    Quay lại trang chủ
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {layout === "centered_card" && (
                <div className="w-full max-w-2xl mx-auto">
                  <Card className="p-6 sm:p-8 border border-border/80 bg-card/50 shadow-md">
                    {renderFormFields()}
                  </Card>
                  {socialChannels.mapEmbedUrl?.show && socialChannels.mapEmbedUrl?.value && (
                    <div className="mt-8 w-full border border-border rounded-3xl overflow-hidden aspect-video bg-muted/10 relative shadow-sm">
                      <iframe
                        src={socialChannels.mapEmbedUrl.value}
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: socialChannels.mapEmbedUrl.height || 250 }}
                        allowFullScreen={false}
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              )}

              {layout === "full_width" && (
                <div className="flex flex-col gap-8 w-full">
                  <Card className="p-6 sm:p-8 border border-border/80 bg-card/50 shadow-md">
                    {renderFormFields()}
                  </Card>
                  {renderSocialInfo()}
                </div>
              )}

              {layout === "split_form_left" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <Card className="p-6 sm:p-8 border border-border/80 bg-card/50 shadow-md h-full">
                      {renderFormFields()}
                    </Card>
                  </div>
                  <div className="lg:col-span-5">
                    {renderSocialInfo()}
                  </div>
                </div>
              )}

              {layout === "split_form_right" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
                  <div className="lg:col-span-5 order-2 lg:order-1">
                    {renderSocialInfo()}
                  </div>
                  <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-between">
                    <Card className="p-6 sm:p-8 border border-border/80 bg-card/50 shadow-md h-full">
                      {renderFormFields()}
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
