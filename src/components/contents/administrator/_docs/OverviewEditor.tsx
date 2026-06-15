"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { toast } from "sonner";
import { MdxEditor, UI_COMPONENTS_TEMPLATES, insertMdxAtCursor } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";

interface OverviewEditorProps {
  mode: "create" | "edit";
  initialId?: string;
}

export default function OverviewEditor({ mode, initialId }: OverviewEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiTypeFromUrl = searchParams.get("apiType") || "default";

  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"content" | "seo">("content");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<"thumbnail" | "editor">("thumbnail");
  const [isSaving, setIsSaving] = useState(false);

  // Form states grouped under formData to match CMS & Blog Editor
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    thumbnail: "",
    description: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isActive: true,
    apiType: apiTypeFromUrl,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch overview if editing
  const { data: overview, isLoading } = trpc.administrator.apiDocs.getOverviewById.useQuery(
    { id: initialId! },
    {
      enabled: mode === "edit" && !!initialId,
      refetchOnWindowFocus: false,
    }
  );

  // Populate data when loaded
  useEffect(() => {
    if (mode === "edit" && overview) {
      setFormData({
        title: overview.title,
        slug: overview.slug,
        thumbnail: overview.thumbnail || "",
        description: overview.description || "",
        content: overview.content,
        metaTitle: overview.metaTitle || "",
        metaDescription: overview.metaDescription || "",
        metaKeywords: overview.metaKeywords || "",
        isActive: overview.isActive,
        apiType: overview.apiType,
      });
    }
  }, [overview, mode]);

  useEffect(() => {
    if (mode === "create" && apiTypeFromUrl) {
      setFormData((prev) => ({ ...prev, apiType: apiTypeFromUrl }));
    }
  }, [apiTypeFromUrl, mode]);

  // Mutation
  const upsertOverviewMutation = trpc.administrator.apiDocs.upsertOverview.useMutation();

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

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: mode === "create" ? slugify(val) : prev.slug,
    }));
  };

  const insertAtCursor = (textToInsert: string) => {
    insertMdxAtCursor(textareaRef.current, textToInsert, formData.content || "", (val) => {
      setFormData((prev) => ({ ...prev, content: val }));
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề tài liệu");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Vui lòng nhập slug định danh");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Nội dung tài liệu không được để trống");
      return;
    }

    try {
      setIsSaving(true);
      await upsertOverviewMutation.mutateAsync({
        id: mode === "edit" ? initialId : undefined,
        apiType: formData.apiType,
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        content: formData.content,
        thumbnail: formData.thumbnail || null,
        metaTitle: formData.metaTitle || null,
        metaDescription: formData.metaDescription || null,
        metaKeywords: formData.metaKeywords || null,
        isActive: formData.isActive,
      });

      toast.success(mode === "create" ? "Đã tạo tài liệu mới thành công!" : "Đã cập nhật tài liệu thành công!");
      router.push("/adminPanel/docs");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu tài liệu");
    } finally {
      setIsSaving(false);
    }
  };

  // Full detailed premium skeleton loading
  if (!mounted || (mode === "edit" && isLoading)) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                  <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Tài liệu API</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Quản lý các tài liệu kỹ thuật, danh mục API, API Endpoints và các phiên bản sản phẩm/API.
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

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
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

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit whitespace-nowrap">
              <Skeleton className="h-8 w-32 rounded-lg animate-pulse" />
              <Skeleton className="h-8 w-32 rounded-lg animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-24 animate-pulse" />
                    <Skeleton className="h-9 w-full animate-pulse" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-48 animate-pulse" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-10 animate-pulse" />
                      <Skeleton className="h-9 flex-1 animate-pulse" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-20 animate-pulse" />
                    <Skeleton className="h-16 w-full animate-pulse" />
                  </div>

                  <div className="border border-border/60 rounded-xl overflow-hidden bg-background space-y-2">
                    <div className="flex items-center justify-between border-b border-border/80 bg-muted/10 p-2">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                        <div className="w-px h-4 bg-border/80 mx-1" />
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                        <Skeleton className="h-6 w-6 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-6 w-14 rounded animate-pulse" />
                        <Skeleton className="h-6 w-14 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-[90%] animate-pulse" />
                      <Skeleton className="h-4 w-[80%] animate-pulse" />
                      <Skeleton className="h-4 w-[85%] animate-pulse" />
                      <Skeleton className="h-4 w-[50%] animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                  <div className="border-b pb-2 border-border/60 flex items-center justify-between">
                    <Skeleton className="h-4 w-36 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28 animate-pulse" />
                      <Skeleton className="h-3 w-40 animate-pulse" />
                    </div>
                    <Skeleton className="h-6 w-10 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 animate-pulse" />
                    <Skeleton className="h-9 w-full animate-pulse" />
                  </div>
                </div>

                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                  <div className="border-b pb-2 border-border/60">
                    <Skeleton className="h-4 w-44 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-9 flex-1 animate-pulse" />
                    <Skeleton className="h-9 w-9 rounded-md animate-pulse" />
                  </div>
                  <Skeleton className="h-28 w-full rounded-xl animate-pulse" />
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
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:document-text-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tài liệu API</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý các tài liệu kỹ thuật, danh mục API, API Endpoints và các phiên bản sản phẩm/API.
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

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/adminPanel/docs")}
                className="size-8 rounded-lg p-0 shrink-0"
                title="Quay lại danh sách"
              >
                <Icon icon="solar:arrow-left-line-duotone" className="size-5" />
              </Button>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {mode === "edit" ? "Chỉnh sửa tài liệu hướng dẫn" : "Tạo tài liệu hướng dẫn mới"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mode === "edit" ? `Đang chỉnh sửa tài liệu: ${formData.title}` : "Điền thông tin và tạo tài liệu hướng dẫn mới."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/adminPanel/docs")}
                className="text-xs font-semibold"
              >
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
                <span>Lưu tài liệu</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
            <button
              onClick={() => setActiveSubTab("content")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeSubTab === "content"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:document-text-line-duotone" className="size-4" />
              <span>Nội dung chính</span>
            </button>
            <button
              onClick={() => setActiveSubTab("seo")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                activeSubTab === "seo"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:magnifer-zoom-in-line-duotone" className="size-4" />
              <span>Tối ưu SEO (Meta)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-5">
              {activeSubTab === "content" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1">
                        Tiêu đề tài liệu <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Nhập tiêu đề hướng dẫn..."
                        className="h-9 text-[13px]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1">
                        Đường dẫn URL (Slug) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                        placeholder="slug-tieu-de"
                        className="h-9 text-[13px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả tóm tắt nội dung tài liệu..."
                      className="h-16 text-[13px] resize-none"
                    />
                  </div>

                  {/* MDX Markdown Editor */}
                  <MdxEditor
                    ref={textareaRef}
                    value={formData.content}
                    onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                    onOpenGallery={() => {
                      setGalleryTarget("editor");
                      setGalleryOpen(true);
                    }}
                    scope={{}}
                  />
                </div>
              )}

              {activeSubTab === "seo" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Meta Title (Tiêu đề tìm kiếm)</label>
                    <Input
                      value={formData.metaTitle}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Mặc định là tiêu đề tài liệu nếu bỏ trống..."
                      className="h-9 text-[13px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Meta Description (Mô tả tìm kiếm)</label>
                    <Textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Nhập mô tả chuẩn SEO..."
                      className="h-24 text-[13px] resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Meta Keywords (Từ khóa tìm kiếm)</label>
                    <Input
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                      placeholder="Từ khóa cách nhau bằng dấu phẩy..."
                      className="h-9 text-[13px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Settings Panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:settings-line-duotone" className="size-4 text-vanixjnk" />
                  Trạng thái & Xuất bản
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-foreground">Kích hoạt trang</span>
                    <span className="text-[10px] text-muted-foreground">Hiển thị công khai lên website</span>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(val) => setFormData((prev) => ({ ...prev, isActive: val }))}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Ngày xuất bản</span>
                  <div className="flex items-center gap-2 p-2.5 bg-background border border-border rounded-lg text-xs font-mono text-muted-foreground select-none">
                    <Icon icon="solar:calendar-line-duotone" className="size-4" />
                    {formData.isActive ? (
                      <span>Tự động kích hoạt khi lưu</span>
                    ) : (
                      <span className="italic text-muted-foreground/60">(Đang ở chế độ ẩn)</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60">
                  <label className="text-xs font-bold text-foreground">Phiên bản / Loại API</label>
                  <Input
                    value={formData.apiType}
                    disabled
                    className="h-9 text-[13px] bg-muted/30 opacity-80"
                  />
                </div>
              </div>

              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:gallery-line-duotone" className="size-4 text-vanixjnk" />
                  Ảnh đại diện (Thumbnail)
                </h4>

                <div className="flex items-center gap-2">
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="Đường dẫn ảnh bìa..."
                    className="h-9 text-xs flex-1 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryTarget("thumbnail");
                      setGalleryOpen(true);
                    }}
                    className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0"
                    title="Chọn ảnh"
                  >
                    <Icon icon="solar:gallery-line-duotone" className="size-5" />
                  </button>
                </div>

                <div className="flex flex-col justify-center border border-border/50 rounded-xl bg-muted/20 min-h-[120px] p-2 items-center text-center overflow-hidden">
                  {formData.thumbnail ? (
                    <img src={formData.thumbnail} alt="Thumbnail preview" className="max-h-24 w-auto object-contain rounded-lg shadow-sm" />
                  ) : (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Icon icon="solar:gallery-remove-line-duotone" /> Chưa có ảnh bìa
                    </span>
                  )}
                </div>
              </div>

              {/* MDX quick elements side panel */}
              {activeSubTab === "content" && (
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
                        <span className="text-[9px] text-muted-foreground line-clamp-1">
                          {comp.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              thumbnail: prev.thumbnail || url
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              thumbnail: url
            }));
          }
          setGalleryOpen(false);
          toast.success("Đã chọn ảnh thành công!");
        }}
      />
    </div>
  );
}
