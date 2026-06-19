"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { toast } from "sonner";
import { MdxEditor, UI_COMPONENTS_TEMPLATES, insertMdxAtCursor } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import type { FormFieldConfig, Service } from "@/server/db/schemas/service.schema";
import { DeviconPicker } from "./DeviconPicker";
import { IconPicker } from "@/components/vanixjnk/icon-picker";

interface ServiceEditorProps {
  mode: "create" | "edit";
  initialId?: string;
}

function formatCurrencyInput(value: string | number): string {
  const strValue = String(value);
  const raw = strValue.replace(/\D/g, "");
  if (!raw) return "";
  return Number(raw).toLocaleString("vi-VN");
}

function parseCurrencyInput(value: string): number {
  const raw = value.replace(/\D/g, "");
  return raw ? Number(raw) : 0;
}

export default function ServiceEditor({ mode, initialId }: ServiceEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    typeId: "",
    description: "",
    content: "",
    thumbnail: "",
    basePrice: 0,
    priceType: "starting_at" as "starting_at" | "fixed" | "contact",
    deliveryTime: null as number | null,
    status: "active" as "active" | "draft" | "disabled",
    technologies: [] as string[],
    features: [] as { name: string; description?: string | null; icon?: string | null }[],
    fieldsConfig: [] as FormFieldConfig[],
    metadata: {} as Record<string, any>,
  });

  const [editorTab, setEditorTab] = useState<"content" | "pricing" | "features" | "formConfig">("content");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<"thumbnail" | "editor">("thumbnail");
  const [deviconPickerOpen, setDeviconPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { data: serverService, isLoading: isLoadingService, error: loadError } = trpc.administrator.services.getById.useQuery(
    { id: initialId as string },
    {
      enabled: mode === "edit" && !!initialId,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const { data: serviceTypesData } = trpc.administrator.services.getTypes.useQuery(undefined, { refetchOnWindowFocus: false });
  const serviceTypesList = serviceTypesData?.data || [];

  const createMutation = trpc.administrator.services.create.useMutation();
  const updateMutation = trpc.administrator.services.update.useMutation();

  useEffect(() => {
    if (serverService) {
      setFormData({
        name: serverService.name,
        slug: serverService.slug,
        typeId: serverService.typeId || "",
        description: serverService.description || "",
        content: serverService.content,
        thumbnail: serverService.thumbnail || "",
        basePrice: serverService.basePrice,
        priceType: serverService.priceType as any,
        deliveryTime: serverService.deliveryTime,
        status: serverService.status as any,
        technologies: serverService.technologies || [],
        features: (serverService.features || []) as any,
        fieldsConfig: (serverService.fieldsConfig || []) as any,
        metadata: (serverService.metadata || {}) as any,
      });
    }
  }, [serverService]);

  useEffect(() => {
    if (mode === "create" && serviceTypesList.length > 0 && !formData.typeId) {
      setFormData((prev) => ({ ...prev, typeId: serviceTypesList[0].id }));
    }
  }, [serviceTypesList, mode]);

  useEffect(() => {
    if (loadError) {
      toast.error(loadError.message || "Không thể tải dữ liệu dịch vụ!");
      router.push("/adminPanel/services");
    }
  }, [loadError, router]);

  const insertAtCursor = (textToInsert: string) => {
    insertMdxAtCursor(textareaRef.current, textToInsert, formData.content || "", (val) => {
      setFormData((prev) => ({ ...prev, content: val }));
    });
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (nameVal: string) => {
    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: slugify(nameVal),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Tên dịch vụ không được để trống!");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Đường dẫn (slug) không được để trống!");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Nội dung giới thiệu không được để trống!");
      return;
    }

    try {
      setIsSaving(true);
      if (mode === "edit" && initialId) {
        await updateMutation.mutateAsync({
          id: initialId,
          data: formData,
        });
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Tạo dịch vụ mới thành công!");
      }
      router.push("/adminPanel/services");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu dịch vụ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/adminPanel/services");
  };

  const addDynamicField = () => {
    const newField: FormFieldConfig = {
      key: `field_${Date.now()}`,
      label: "Trường câu hỏi mới",
      type: "text",
      required: false,
      placeholder: "",
      options: [],
    };
    setFormData((prev) => ({
      ...prev,
      fieldsConfig: [...prev.fieldsConfig, newField],
    }));
  };

  const removeDynamicField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fieldsConfig: prev.fieldsConfig.filter((_, i) => i !== index),
    }));
  };

  const updateDynamicField = (index: number, key: keyof FormFieldConfig, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.fieldsConfig];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, fieldsConfig: updated };
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { name: "", description: "", icon: "solar:check-circle-line-duotone" }],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, features: updated };
    });
  };

  if (mode === "edit" && isLoadingService) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                  <Icon icon="solar:case-round-line-duotone" className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Dịch vụ & Đơn hàng</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Quản lý danh mục dịch vụ kỹ thuật, thời gian bàn giao và cấu hình form khảo sát.
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

        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
          <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-40 animate-pulse" />
                  <Skeleton className="h-3 w-60 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Skeleton className="h-8 w-14 animate-pulse" />
                <Skeleton className="h-8 w-28 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-transparent w-full sm:w-auto shrink-0">
                  <Skeleton className="size-4 rounded shrink-0" />
                  <Skeleton className="h-3.5 w-24 rounded" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              <div className="lg:col-span-8 space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-48 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-10 rounded-md shrink-0" />
                      <Skeleton className="h-9 w-full rounded-md" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-9 w-full rounded-md" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-16 w-full rounded-md" />
                  </div>

                  <div className="flex flex-col gap-2 border border-border/60 rounded-xl p-4 bg-muted/10">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-6 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-8 w-14 rounded" />
                        <Skeleton className="h-8 w-14 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                  <div className="flex items-center gap-1.5 border-b pb-2 border-border/60">
                    <Skeleton className="size-4 rounded shrink-0" />
                    <Skeleton className="h-4 w-32 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3 w-36 rounded" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-md" />
                  </div>
                </div>

                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 border-b pb-2 border-border/60">
                    <Skeleton className="size-4 rounded shrink-0" />
                    <Skeleton className="h-4 w-44 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-full rounded-md" />
                    <Skeleton className="size-9 rounded-md shrink-0" />
                  </div>
                  <div className="border border-border/50 rounded-xl bg-muted/20 min-h-[120px] p-2 flex items-center justify-center">
                    <Skeleton className="h-24 w-40 rounded-lg animate-pulse" />
                  </div>
                </div>

                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                  <div className="flex flex-col gap-1.5 border-b pb-2 border-border/60">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="size-4 rounded shrink-0" />
                      <Skeleton className="h-4 w-48 rounded" />
                    </div>
                    <Skeleton className="h-3 w-56 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-2 rounded-lg bg-background border border-border/60 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Skeleton className="size-6 rounded shrink-0" />
                          <Skeleton className="h-3.5 w-16 rounded" />
                        </div>
                        <Skeleton className="h-2.5 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:case-round-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dịch vụ & Đơn hàng</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý danh mục dịch vụ kỹ thuật, thời gian bàn giao và cấu hình form khảo sát.
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

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="size-8 rounded-lg p-0 shrink-0"
                title="Quay lại danh sách"
              >
                <Icon icon="solar:arrow-left-line-duotone" className="size-5" />
              </Button>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {mode === "edit" ? "Chỉnh sửa dịch vụ" : "Tạo dịch vụ kỹ thuật mới"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mode === "edit" ? `Đang thiết lập cấu hình cho: ${formData.name}` : "Điền thông tin chi tiết dịch vụ mới."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs font-semibold">
                Hủy
              </Button>
              <Button
                variant="vanixjnk"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1.5 font-bold shadow-md text-xs"
              >
                {isSaving ? (
                  <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                ) : (
                  <Icon icon="solar:diskette-line-duotone" className="size-4" />
                )}
                <span>Lưu dịch vụ</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
            {[
              { id: "content", label: "Nội dung & Thông tin", icon: "solar:document-text-line-duotone" },
              { id: "pricing", label: "Định giá & Công nghệ", icon: "solar:tag-price-line-duotone" },
              { id: "features", label: "Đặc quyền & Tính năng", icon: "solar:star-line-duotone" },
              { id: "formConfig", label: "Form Khảo sát", icon: "solar:settings-minimalistic-line-duotone" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEditorTab(tab.id as any)}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                  editorTab === tab.id
                    ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                    : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <Icon icon={tab.icon} className="size-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-5">
              
              {editorTab === "content" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Tên dịch vụ <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ví dụ: Lập trình Bot Discord"
                      className="h-9 text-[13px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Đường dẫn URL thân thiện (Slug) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center bg-muted/40 border border-border/80 px-2.5 rounded-md text-[11px] text-muted-foreground select-none">
                        /
                      </div>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="lap-trinh-bot-discord"
                        className="h-9 text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Phân loại dịch vụ</label>
                    <Select
                      value={formData.typeId}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, typeId: val }))}
                    >
                      <SelectTrigger className="h-9 text-[13px] w-full">
                        <SelectValue placeholder="Chọn loại dịch vụ..." />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypesList.map((type) => (
                          <SelectItem key={type.id} value={type.id} className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <Icon
                                icon={type.icon || "solar:globus-line-duotone"}
                                className={cn("size-4", type.color || "text-primary")}
                              />
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Tóm tắt ngắn gọn dịch vụ..."
                      className="h-16 text-[13px] resize-none"
                    />
                  </div>

                  <MdxEditor
                    ref={textareaRef}
                    value={formData.content || ""}
                    onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                    onOpenGallery={() => {
                      setGalleryTarget("editor");
                      setGalleryOpen(true);
                    }}
                    scope={{ formData }}
                  />
                </div>
              )}

              {editorTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Cách hiển thị giá</label>
                      <Select
                        value={formData.priceType}
                        onValueChange={(val: any) => setFormData((prev) => ({ ...prev, priceType: val }))}
                      >
                        <SelectTrigger className="h-9 text-[13px] w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starting_at" className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:tag-price-line-duotone" className="size-4 text-blue-500" />
                              <span>Giá khởi điểm (Từ...)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="fixed" className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:lock-line-duotone" className="size-4 text-green-500" />
                              <span>Giá cố định</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="contact" className="text-[13px]">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:chat-round-line-duotone" className="size-4 text-amber-500" />
                              <span>Giá liên hệ thỏa thuận</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Giá khởi điểm (VNĐ)</label>
                      <Input
                        type="text"
                        value={formatCurrencyInput(formData.basePrice)}
                        onChange={(e) => {
                          const parsed = parseCurrencyInput(e.target.value);
                          setFormData((prev) => ({ ...prev, basePrice: parsed }));
                        }}
                        className="h-9 text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Thời gian hoàn thành (ngày)</label>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 7"
                        value={formData.deliveryTime || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            deliveryTime: parseInt(e.target.value) || null,
                          }))
                        }
                        className="h-9 text-[13px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Tags công nghệ / công cụ</label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] font-semibold px-2 cursor-pointer"
                          onClick={() => setDeviconPickerOpen(true)}
                        >
                          <Icon icon="solar:add-circle-line-duotone" className="mr-1 text-sm text-emerald-500" />
                          Thêm
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 p-2 border border-border/60 bg-muted/20 rounded-lg min-h-[36px] items-center">
                        {formData.technologies.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground self-center px-1">Chưa chọn công nghệ</span>
                        ) : (
                          formData.technologies.map((tech) => (
                            <Badge
                              key={tech}
                              className="flex items-center gap-1.5 py-0.5 px-2 bg-background border border-border text-foreground hover:bg-muted font-medium text-[11px] select-none"
                            >
                              <Icon icon={tech} className="text-sm shrink-0" />
                              <span>{tech.replace("devicon:", "").replace("-wordmark", "")}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    technologies: prev.technologies.filter((t) => t !== tech),
                                  }));
                                }}
                                className="text-muted-foreground hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                              >
                                <Icon icon="solar:close-circle-bold" className="size-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editorTab === "features" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Đặc quyền và Tính năng mặc định</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Danh sách các điểm nổi bật đi kèm của dịch vụ.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={addFeature}
                      className="gap-1.5 h-8 text-[11px] font-semibold cursor-pointer"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                      <span>Thêm tính năng</span>
                    </Button>
                  </div>

                  {formData.features.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-border/80 rounded-2xl text-muted-foreground/60 text-xs flex flex-col items-center justify-center gap-2 bg-background/50">
                      <Icon icon="solar:star-line-duotone" className="size-8 text-muted-foreground/40" />
                      <span>Chưa có tính năng đặc thù nào được thêm.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-border/80 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all flex flex-col gap-3.5 relative group"
                        >
                          <Button
                            variant="danger"
                            size="icon-sm"
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFeature(idx)}
                            title="Xóa tính năng"
                          >
                            <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                          </Button>

                          <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                            <div className="size-6 rounded-lg flex items-center justify-center bg-vanixjnk/10 border border-vanixjnk/20 text-vanixjnk">
                              <Icon icon={feature.icon || "solar:star-line-duotone"} className="size-3.5" />
                            </div>
                            <span className="text-xs font-bold text-foreground">Tính năng #{idx + 1}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Tên tính năng</label>
                              <Input
                                className="h-9 text-[13px]"
                                placeholder="e.g. Tối ưu hiệu năng"
                                value={feature.name}
                                onChange={(e) => updateFeature(idx, "name", e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Biểu tượng (Icon)</label>
                              <div className="flex items-center gap-1.5">
                                <Input
                                  className="h-9 text-[13px] flex-1"
                                  placeholder="e.g. solar:stars-line-duotone"
                                  value={feature.icon || ""}
                                  onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                                />
                                <IconPicker
                                  value={feature.icon || "solar:stars-line-duotone"}
                                  onChange={(val) => updateFeature(idx, "icon", val)}
                                  trigger={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      title="Chọn biểu tượng"
                                      className="size-9 rounded-lg shrink-0 cursor-pointer"
                                    >
                                      <Icon icon={feature.icon || "solar:stars-line-duotone"} className="text-base" />
                                    </Button>
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[11px] font-bold text-foreground">Mô tả ngắn gọn</label>
                              <Input
                                className="h-9 text-[13px]"
                                placeholder="e.g. Đảm bảo chạy mượt trên VPS"
                                value={feature.description || ""}
                                onChange={(e) => updateFeature(idx, "description", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editorTab === "formConfig" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Phiếu khảo sát nhu cầu tùy chỉnh</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Thêm các câu hỏi khảo sát khi khách hàng đặt dịch vụ này.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={addDynamicField}
                      className="gap-1.5 h-8 text-[11px] font-semibold cursor-pointer"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                      <span>Thêm câu hỏi</span>
                    </Button>
                  </div>

                  {formData.fieldsConfig.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-border/80 rounded-2xl text-muted-foreground/60 text-xs flex flex-col items-center justify-center gap-2 bg-background/50">
                      <Icon icon="solar:document-text-line-duotone" className="size-8 text-muted-foreground/40" />
                      <span>Chưa cấu hình trường khảo sát nào cho dịch vụ này.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.fieldsConfig.map((field, idx) => {
                        const fieldTypeDetails: Record<string, { label: string; icon: string; color: string }> = {
                          text: {
                            label: "Chữ ngắn (text)",
                            icon: "solar:text-field-focus-line-duotone",
                            color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                          },
                          textarea: {
                            label: "Đoạn văn (textarea)",
                            icon: "solar:document-text-line-duotone",
                            color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
                          },
                          select: {
                            label: "Hộp chọn (select)",
                            icon: "solar:list-arrow-down-minimalistic-line-duotone",
                            color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                          },
                          multiselect: {
                            label: "Chọn nhiều (multiselect)",
                            icon: "solar:checklist-minimalistic-line-duotone",
                            color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
                          },
                          checkbox: {
                            label: "Hộp kiểm (checkbox)",
                            icon: "solar:check-square-line-duotone",
                            color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                          },
                          number: {
                            label: "Số lượng (number)",
                            icon: "solar:sort-from-top-to-bottom-line-duotone",
                            color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
                          },
                          file: {
                            label: "Đính kèm tệp (file)",
                            icon: "solar:folder-with-files-line-duotone",
                            color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
                          },
                        };
                        const details = fieldTypeDetails[field.type] || {
                          label: field.type,
                          icon: "solar:question-circle-line-duotone",
                          color: "text-muted-foreground bg-muted border-border",
                        };

                        return (
                          <div
                            key={field.key}
                            className="p-4 border border-border/80 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all flex flex-col gap-3 relative group"
                          >
                            <Button
                              variant="danger"
                              size="icon-sm"
                              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeDynamicField(idx)}
                              title="Xóa câu hỏi"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                            </Button>

                            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                              <div
                                className={cn("size-6 rounded-lg flex items-center justify-center border", details.color)}
                              >
                                <Icon icon={details.icon} className="size-3.5" />
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                Câu hỏi #{idx + 1}: <span className="font-semibold text-muted-foreground/80">{details.label}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-foreground">Tiêu đề câu hỏi (Label)</label>
                                <Input
                                  className="h-9 text-[13px]"
                                  placeholder="e.g. Phiên bản game"
                                  value={field.label}
                                  onChange={(e) => updateDynamicField(idx, "label", e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-foreground">Loại trường nhập</label>
                                <Select value={field.type} onValueChange={(val) => updateDynamicField(idx, "type", val)}>
                                  <SelectTrigger className="h-9 text-[13px] w-full">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text" className="text-[13px]">
                                      <span className="flex items-center gap-2">
                                        <Icon icon="solar:text-field-focus-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                                        <span>Chữ ngắn (text)</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="textarea" className="text-[13px]">
                                      <span className="flex items-center gap-2">
                                        <Icon icon="solar:document-text-line-duotone" className="size-3.5 shrink-0 text-indigo-500" />
                                        <span>Đoạn văn (textarea)</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="select" className="text-[13px]">
                                      <span className="flex items-center gap-2">
                                        <Icon icon="solar:list-arrow-down-minimalistic-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                                        <span>Hộp chọn (select)</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="multiselect" className="text-[13px]">
                                      <span className="flex items-center gap-2">
                                        <Icon icon="solar:checklist-minimalistic-line-duotone" className="size-3.5 shrink-0 text-teal-500" />
                                        <span>Chọn nhiều (multiselect)</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="checkbox" className="text-[13px]">
                                      <span className="flex items-center gap-2">
                                        <Icon icon="solar:check-square-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                                        <span>Hộp kiểm (checkbox)</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="number" className="text-[13px]">
                                      <span className="flex items-center gap-2">
                                        <Icon icon="solar:sort-from-top-to-bottom-line-duotone" className="size-3.5 shrink-0 text-purple-500" />
                                        <span>Số lượng (number)</span>
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="file" className="text-[13px]">
                                      <span className="flex items-center gap-2">
                                        <Icon icon="solar:folder-with-files-line-duotone" className="size-3.5 shrink-0 text-rose-500" />
                                        <span>Đính kèm tệp (file)</span>
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {["text", "textarea", "number"].includes(field.type) && (
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[11px] font-bold text-foreground">Mẹo gợi ý (Placeholder - tùy chọn)</label>
                                  <Input
                                    className="h-9 text-[13px]"
                                    placeholder="e.g. Nhập phiên bản trò chơi bạn sử dụng..."
                                    value={field.placeholder || ""}
                                    onChange={(e) => updateDynamicField(idx, "placeholder", e.target.value)}
                                  />
                                </div>
                              )}

                              {["select", "multiselect"].includes(field.type) && (
                                <div className="space-y-1 md:col-span-2">
                                  <label className="text-[11px] font-bold text-foreground">
                                    Các tùy chọn (phân tách bằng dấu phẩy)
                                  </label>
                                  <Input
                                    className="h-9 text-[13px]"
                                    placeholder="e.g. 1.20, 1.21, 1.19"
                                    value={field.options ? field.options.join(", ") : ""}
                                    onChange={(e) =>
                                      updateDynamicField(
                                        idx,
                                        "options",
                                        e.target.value.split(",").map((o) => o.trim())
                                      )
                                    }
                                  />
                                </div>
                              )}

                              <div className="flex items-center gap-2 md:col-span-2 pt-1">
                                <Switch
                                  id={`req-${field.key}`}
                                  checked={field.required}
                                  onCheckedChange={(val) => updateDynamicField(idx, "required", val)}
                                />
                                <label
                                  htmlFor={`req-${field.key}`}
                                  className="text-[11px] font-semibold text-foreground cursor-pointer select-none"
                                >
                                  Bắt buộc khách hàng điền
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              
              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:settings-line-duotone" className="size-4 text-vanixjnk" />
                  Trạng thái & Xuất bản
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-foreground">Kích hoạt hiển thị</span>
                    <span className="text-[10px] text-muted-foreground">Công khai dịch vụ này ra ngoài.</span>
                  </div>
                  <Select
                    value={formData.status}
                    onValueChange={(val: any) => setFormData((prev) => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="h-9 text-[13px] w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:check-circle-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                          <span>Hoạt động</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="draft" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:file-text-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                          <span>Bản nháp</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="disabled" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:slash-circle-line-duotone" className="size-3.5 shrink-0 text-rose-500" />
                          <span>Tạm ngưng</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:gallery-line-duotone" className="size-4 text-vanixjnk" />
                  Ảnh đại diện dịch vụ (Thumbnail)
                </h4>

                <div className="flex items-center gap-2">
                  <Input
                    value={formData.thumbnail || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="Đường dẫn ảnh bìa..."
                    className="h-9 text-[13px] flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryTarget("thumbnail");
                      setGalleryOpen(true);
                    }}
                    className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0"
                    title="Chọn ảnh từ thư viện"
                  >
                    <Icon icon="solar:gallery-line-duotone" className="size-5" />
                  </button>
                </div>

                <div className="flex flex-col justify-center border border-border/50 rounded-xl bg-muted/20 min-h-[120px] p-2 items-center text-center overflow-hidden">
                  {formData.thumbnail ? (
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail preview"
                      className="max-h-24 w-auto object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Icon icon="solar:gallery-remove-line-duotone" /> Chưa có ảnh bìa
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                <div className="flex flex-col gap-0.5 border-b pb-2 border-border/60">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Icon icon="solar:widget-add-line-duotone" className="size-4 text-vanixjnk" />
                    Thành phần UI (MDX & Shadcn)
                  </h4>
                  <span className="text-[10px] text-muted-foreground">Click để chèn nhanh component tại con trỏ</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {UI_COMPONENTS_TEMPLATES.map((comp) => (
                    <button
                      key={`side-${comp.name}`}
                      type="button"
                      onClick={() => insertAtCursor(comp.template)}
                      className="flex flex-col items-start gap-1 p-2 rounded-lg bg-background border border-border/60 hover:border-vanixjnk/40 hover:bg-vanixjnk/5 transition-all duration-200 group text-left w-full shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <div className="size-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-vanixjnk/10 group-hover:text-vanixjnk transition-colors shrink-0">
                          <Icon icon={comp.icon} className="size-4" />
                        </div>
                        <span className="text-[11px] font-bold text-foreground group-hover:text-vanixjnk transition-colors truncate">
                          {comp.name}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground line-clamp-1">{comp.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GalleryDialog
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        onSelect={(url) => {
          if (galleryTarget === "editor") {
            insertAtCursor(`\n![Hình ảnh](${url})\n`);
            setFormData((prev) => ({
              ...prev,
              thumbnail: prev.thumbnail || url,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              thumbnail: url,
            }));
          }
          setGalleryOpen(false);
          toast.success("Đã chọn ảnh thành công!");
        }}
      />

      <DeviconPicker
        open={deviconPickerOpen}
        onOpenChange={setDeviconPickerOpen}
        onSelect={(iconName) => {
          if (!formData.technologies.includes(iconName)) {
            setFormData((prev) => ({
              ...prev,
              technologies: [...prev.technologies, iconName],
            }));
          }
        }}
        selectedIcons={formData.technologies}
      />
    </div>
  );
}
