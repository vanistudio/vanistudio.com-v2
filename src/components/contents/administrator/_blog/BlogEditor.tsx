"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { trpc } from "@/lib/trpc";
import { BlogMock } from "./types";

interface BlogEditorProps {
  mode: "create" | "edit";
  initialId?: string;
}

export default function BlogEditor({ mode, initialId }: BlogEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<BlogMock>>({
    title: "",
    slug: "",
    description: "",
    content: "",
    thumbnail: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isActive: true,
    isFeatured: false,
    views: 0,
    likes: 0,
    readingTime: 0,
    tags: [],
    authorId: null,
  });

  const [editorTab, setEditorTab] = useState<"content" | "seo">("content");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<"thumbnail" | "editor">("thumbnail");
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { data: serverBlog, isLoading: isLoadingBlog, error: loadError } = trpc.administrator.blog.getById.useQuery(
    { id: initialId as string },
    {
      enabled: mode === "edit" && !!initialId,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const utils = trpc.useUtils();
  const createMutation = trpc.administrator.blog.create.useMutation();
  const updateMutation = trpc.administrator.blog.update.useMutation();

  useEffect(() => {
    if (serverBlog) {
      setFormData({
        title: serverBlog.title,
        slug: serverBlog.slug,
        description: serverBlog.description || "",
        content: serverBlog.content,
        thumbnail: serverBlog.thumbnail || "",
        metaTitle: serverBlog.metaTitle || "",
        metaDescription: serverBlog.metaDescription || "",
        metaKeywords: serverBlog.metaKeywords || "",
        isActive: serverBlog.isActive,
        isFeatured: serverBlog.isFeatured,
        views: serverBlog.views,
        likes: serverBlog.likes,
        readingTime: serverBlog.readingTime,
        tags: serverBlog.tags || [],
        authorId: serverBlog.authorId || null,
      });
    }
  }, [serverBlog]);

  useEffect(() => {
    if (loadError) {
      toast.error(loadError.message || "Không thể tải dữ liệu bài viết Blog!");
      router.push("/adminPanel/blog");
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

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      toast.error("Tiêu đề bài viết không được để trống!");
      return;
    }
    if (!formData.slug?.trim()) {
      toast.error("Đường dẫn (Slug) không được để trống!");
      return;
    }
    if (!formData.content?.trim()) {
      toast.error("Nội dung bài viết không được để trống!");
      return;
    }

    try {
      setIsSaving(true);
      if (mode === "edit" && initialId) {
        await updateMutation.mutateAsync({
          id: initialId,
          data: {
            title: formData.title,
            slug: formData.slug,
            description: formData.description || null,
            content: formData.content,
            thumbnail: formData.thumbnail || null,
            metaTitle: formData.metaTitle || null,
            metaDescription: formData.metaDescription || null,
            metaKeywords: formData.metaKeywords || null,
            isActive: formData.isActive ?? true,
            isFeatured: formData.isFeatured ?? false,
            views: formData.views ?? 0,
            likes: formData.likes ?? 0,
            readingTime: formData.readingTime ?? 0,
            tags: formData.tags || [],
            authorId: formData.authorId || null,
          },
        });
        toast.success("Cập nhật bài viết Blog thành công!");
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          slug: formData.slug,
          description: formData.description || null,
          content: formData.content,
          thumbnail: formData.thumbnail || null,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          metaKeywords: formData.metaKeywords || null,
          isActive: formData.isActive ?? true,
          isFeatured: formData.isFeatured ?? false,
          views: formData.views ?? 0,
          likes: formData.likes ?? 0,
          readingTime: formData.readingTime ?? 0,
          tags: formData.tags || [],
          authorId: formData.authorId || null,
        });
        toast.success("Thêm mới bài viết Blog thành công!");
      }
      utils.administrator.blog.getStats.invalidate();
      router.push("/adminPanel/blog");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu bài viết");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/adminPanel/blog");
  };

  if (mode === "edit" && isLoadingBlog) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                  <Icon icon="solar:bookmark-line-duotone" className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Bài viết Blog</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Quản lý bài viết blog, tin tức công nghệ và chia sẻ kiến thức của Vani Studio.
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
                <Skeleton className="size-8 rounded-lg" />
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

                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                  <div className="border-b pb-2 border-border/60 space-y-1">
                    <Skeleton className="h-4 w-40 animate-pulse" />
                    <Skeleton className="h-3 w-56 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-14 w-full rounded-lg animate-pulse" />
                    <Skeleton className="h-14 w-full rounded-lg animate-pulse" />
                    <Skeleton className="h-14 w-full rounded-lg animate-pulse" />
                    <Skeleton className="h-14 w-full rounded-lg animate-pulse" />
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
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:bookmark-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Bài viết Blog</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý bài viết blog, tin tức công nghệ và chia sẻ kiến thức của Vani Studio.
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
                onClick={handleCancel}
                className="size-8 rounded-lg p-0 shrink-0"
                title="Quay lại danh sách"
              >
                <Icon icon="solar:arrow-left-line-duotone" className="size-5" />
              </Button>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {mode === "edit" ? "Chỉnh sửa bài viết Blog" : "Tạo bài viết Blog mới"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mode === "edit" ? `Đang chỉnh sửa bài viết: ${formData.title}` : "Điền thông tin và tạo bài viết mới."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
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
                <span>Lưu bài viết</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
            <button
              onClick={() => setEditorTab("content")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                editorTab === "content"
                  ? "bg-vanixjnk/15 border border-vanixjnk/25 text-vanixjnk shadow-sm"
                  : "border border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              )}
            >
              <Icon icon="solar:document-text-line-duotone" className="size-4" />
              <span>Nội dung bài viết</span>
            </button>
            <button
              onClick={() => setEditorTab("seo")}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto",
                editorTab === "seo"
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

              {editorTab === "content" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      Tiêu đề bài viết <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          title: val,
                          slug: slugify(val),
                        }));
                      }}
                      placeholder="Ví dụ: Hướng dẫn tối ưu SEO cho Website Next.js 16"
                      className="h-9 text-[13px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Đường dẫn URL thân thiện (Slug) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center bg-muted/40 border border-border/80 px-2.5 rounded-md text-[11px] text-muted-foreground select-none font-mono">
                        /blog/
                      </div>
                      <Input
                        value={formData.slug || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="nextjs-16-seo-guide"
                        className="h-9 text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
                    <Textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Tóm tắt ngắn gọn nội dung bài viết blog này dùng để hiển thị..."
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

              {editorTab === "seo" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Meta Title (Tiêu đề SEO)</label>
                    <Input
                      value={formData.metaTitle || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                      placeholder="Tiêu đề hiển thị trên thẻ trình duyệt Google..."
                      className="h-9 text-[13px]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Meta Description (Mô tả SEO)</label>
                    <Textarea
                      value={formData.metaDescription || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                      placeholder="Nhập mô tả tóm tắt để tối ưu kết quả tìm kiếm..."
                      className="h-24 text-[13px] resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Meta Keywords (Từ khóa SEO)</label>
                    <Input
                      value={formData.metaKeywords || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, metaKeywords: e.target.value }))}
                      placeholder="Từ khóa SEO ngăn cách bởi dấu phẩy..."
                      className="h-9 text-[13px]"
                    />
                  </div>
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
                    <span className="text-[12px] font-bold text-foreground">Kích hoạt trang</span>
                    <span className="text-[10px] text-muted-foreground">Công khai bài viết ra ngoài.</span>
                  </div>
                  <Switch
                    checked={formData.isActive || false}
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
              </div>

              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:folder-with-files-line-duotone" className="size-4 text-vanixjnk" />
                  Cấu hình mở rộng
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-foreground">Bài viết nổi bật</span>
                    <span className="text-[10px] text-muted-foreground">Ghim lên đầu trang tin tức.</span>
                  </div>
                  <Switch
                    checked={formData.isFeatured || false}
                    onCheckedChange={(val) => setFormData((prev) => ({ ...prev, isFeatured: val }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Thời gian đọc (phút)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.readingTime ?? 0}
                    onChange={(e) => setFormData((prev) => ({ ...prev, readingTime: parseInt(e.target.value) || 0 }))}
                    placeholder="Ví dụ: 5"
                    className="h-9 text-[13px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Thẻ bài viết (Tags)
                  </label>
                  <Input
                    value={formData.tags?.join(", ") || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()) }))}
                    placeholder="Ví dụ: Rust, AI, NextJS"
                    className="h-9 text-[13px]"
                  />
                </div>

                {mode === "edit" && (
                  <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-background border border-border/60 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Icon icon="solar:eye-line-duotone" className="size-3 text-muted-foreground" />
                        Lượt xem
                      </span>
                      <span className="text-sm font-bold text-foreground mt-0.5">{formData.views ?? 0}</span>
                    </div>
                    <div className="p-2 bg-background border border-border/60 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <Icon icon="solar:heart-line-duotone" className="size-3 text-red-500" />
                        Lượt thích
                      </span>
                      <span className="text-sm font-bold text-foreground mt-0.5">{formData.likes ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:gallery-line-duotone" className="size-4 text-vanixjnk" />
                  Ảnh đại diện bài viết (Thumbnail)
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
