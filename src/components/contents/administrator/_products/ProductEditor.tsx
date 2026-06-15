"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { DateTimePicker } from "@/components/vanixjnk/date-time-picker";
import { toast } from "sonner";
import { MdxEditor, UI_COMPONENTS_TEMPLATES, insertMdxAtCursor } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { IconPicker } from "@/components/vanixjnk/icon-picker";

interface ProductEditorProps {
  mode: "create" | "edit";
  initialId?: string;
}

export default function ProductEditor({ mode, initialId }: ProductEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    content: "",
    type: "source_code",
    status: "active",
    thumbnail: "",
    gallery: [] as string[],
    
    price: 0,
    salePrice: null as number | null,
    currency: "USD",
    badge: "",
    isFeatured: false,
    
    version: "1.0.0",
    licenseType: "single",
    supportMonths: 6,
    fileSize: "",
    compatibility: [] as string[],
    
    demoUrl: "",
    githubUrl: "",
    downloadUrl: "",
    
    features: [] as { name: string; description?: string | null; icon?: string | null }[],
    changelog: [] as { version: string; date: string; title?: string | null; changes: string[] }[],
    metadata: {} as Record<string, any>,
  });

  const [editorTab, setEditorTab] = useState<"content" | "pricing" | "specs" | "features" | "changelog" | "media">("content");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<{ type: "thumbnail" | "gallery" | "content"; index?: number }>({ type: "thumbnail" });
  const [isSaving, setIsSaving] = useState(false);

  const [newCompatibility, setNewCompatibility] = useState("");

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { data: serverProduct, isLoading: isLoadingProduct, error: loadError } = trpc.administrator.products.getById.useQuery(
    { id: initialId as string },
    {
      enabled: mode === "edit" && !!initialId,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const createMutation = trpc.administrator.products.create.useMutation();
  const updateMutation = trpc.administrator.products.update.useMutation();

  useEffect(() => {
    if (serverProduct) {
      setFormData({
        name: serverProduct.name,
        slug: serverProduct.slug,
        description: serverProduct.description || "",
        content: serverProduct.content,
        type: serverProduct.type || "source_code",
        status: serverProduct.status || "active",
        thumbnail: serverProduct.thumbnail || "",
        gallery: serverProduct.gallery || [],
        price: serverProduct.price || 0,
        salePrice: serverProduct.salePrice ?? null,
        currency: serverProduct.currency || "USD",
        badge: serverProduct.badge || "",
        isFeatured: serverProduct.isFeatured || false,
        version: serverProduct.version || "1.0.0",
        licenseType: serverProduct.licenseType || "single",
        supportMonths: serverProduct.supportMonths || 6,
        fileSize: serverProduct.fileSize || "",
        compatibility: serverProduct.compatibility || [],
        demoUrl: serverProduct.demoUrl || "",
        githubUrl: serverProduct.githubUrl || "",
        downloadUrl: serverProduct.downloadUrl || "",
        features: (serverProduct.features || []) as any,
        changelog: (serverProduct.changelog || []) as any,
        metadata: serverProduct.metadata || {},
      });
    }
  }, [serverProduct]);

  useEffect(() => {
    if (loadError) {
      toast.error(loadError.message || "Không thể tải dữ liệu sản phẩm!");
      router.push("/adminPanel/products");
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
      toast.error("Tên sản phẩm không được để trống!");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Đường dẫn (slug) không được để trống!");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Nội dung chi tiết không được để trống!");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice !== null ? Number(formData.salePrice) : null,
      };

      if (mode === "edit" && initialId) {
        await updateMutation.mutateAsync({
          id: initialId,
          data: payload as any,
        });
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Tạo sản phẩm mới thành công!");
      }
      router.push("/adminPanel/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu sản phẩm");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/adminPanel/products");
  };

  const addCompatibility = () => {
    if (!newCompatibility.trim()) return;
    if (formData.compatibility.includes(newCompatibility.trim())) {
      toast.error("Đã tồn tại tương thích này");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      compatibility: [...prev.compatibility, newCompatibility.trim()],
    }));
    setNewCompatibility("");
  };

  const removeCompatibility = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      compatibility: prev.compatibility.filter((c) => c !== val),
    }));
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

  const addChangelog = () => {
    setFormData((prev) => ({
      ...prev,
      changelog: [
        ...prev.changelog,
        { version: "", date: new Date().toISOString().split("T")[0], title: "", changes: [""] },
      ],
    }));
  };

  const removeChangelog = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      changelog: prev.changelog.filter((_, i) => i !== index),
    }));
  };

  const updateChangelogHeader = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.changelog];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, changelog: updated };
    });
  };

  const addChangelogLine = (changelogIndex: number) => {
    setFormData((prev) => {
      const updated = prev.changelog.map((log, idx) => {
        if (idx === changelogIndex) {
          return {
            ...log,
            changes: [...log.changes, ""],
          };
        }
        return log;
      });
      return { ...prev, changelog: updated };
    });
  };

  const removeChangelogLine = (changelogIndex: number, lineIndex: number) => {
    setFormData((prev) => {
      const updated = prev.changelog.map((log, idx) => {
        if (idx === changelogIndex) {
          return {
            ...log,
            changes: log.changes.filter((_, i) => i !== lineIndex),
          };
        }
        return log;
      });
      return { ...prev, changelog: updated };
    });
  };

  const updateChangelogLine = (changelogIndex: number, lineIndex: number, value: string) => {
    setFormData((prev) => {
      const updated = prev.changelog.map((log, idx) => {
        if (idx === changelogIndex) {
          const newChanges = [...log.changes];
          newChanges[lineIndex] = value;
          return {
            ...log,
            changes: newChanges,
          };
        }
        return log;
      });
      return { ...prev, changelog: updated };
    });
  };

  const addGalleryImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, url],
    }));
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSelectImage = (url: string) => {
    if (galleryTarget.type === "thumbnail") {
      setFormData((prev) => ({ ...prev, thumbnail: url }));
    } else if (galleryTarget.type === "gallery") {
      addGalleryImage(url);
    } else {
      insertAtCursor(`![Image](${url})`);
    }
    setGalleryOpen(false);
  };

  if (mode === "edit" && isLoadingProduct) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                  <Icon icon="solar:box-line-duotone" className="text-2xl animate-pulse" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48 animate-pulse" />
                  <Skeleton className="h-4 w-72 animate-pulse" />
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
                <Skeleton className="h-9 w-14 animate-pulse rounded-lg" />
                <Skeleton className="h-9 w-28 animate-pulse rounded-lg" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-fit whitespace-nowrap">
              <Skeleton className="h-9 w-32 rounded-lg animate-pulse" />
              <Skeleton className="h-9 w-32 rounded-lg animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-5">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                  <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-24 animate-pulse" />
                    <Skeleton className="h-9 w-full animate-pulse rounded-lg" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-48 animate-pulse" />
                    <Skeleton className="h-9 w-full animate-pulse rounded-lg" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-20 animate-pulse" />
                    <Skeleton className="h-16 w-full animate-pulse rounded-lg" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-32 animate-pulse" />
                    <Skeleton className="h-40 w-full animate-pulse rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                  <Skeleton className="h-4 w-32 animate-pulse" />
                  <Skeleton className="h-9 w-full animate-pulse rounded-lg" />
                </div>
                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                  <Skeleton className="h-4 w-40 animate-pulse" />
                  <Skeleton className="h-9 w-full animate-pulse rounded-lg" />
                  <Skeleton className="h-9 w-full animate-pulse rounded-lg" />
                </div>
                <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                  <Skeleton className="h-28 w-full animate-pulse rounded-lg" />
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
                <Icon icon="solar:box-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Sản phẩm & Giải pháp</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Thiết lập thông tin thương mại, phân phối giải pháp mã nguồn, bot, script và ứng dụng.
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
                className="size-8 rounded-lg p-0 shrink-0 cursor-pointer"
                title="Quay lại danh sách"
              >
                <Icon icon="solar:arrow-left-line-duotone" className="size-5" />
              </Button>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {mode === "edit" ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mode === "edit" ? `Đang thiết lập cấu hình cho: ${formData.name}` : "Điền chi tiết sản phẩm và các thông số thương mại."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-xs font-semibold cursor-pointer">
                Hủy
              </Button>
              <Button
                variant="vanixjnk"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1.5 font-bold shadow-md text-xs cursor-pointer"
              >
                {isSaving ? (
                  <Icon icon="solar:restart-line-duotone" className="size-4 animate-spin" />
                ) : (
                  <Icon icon="solar:diskette-line-duotone" className="size-4" />
                )}
                <span>Lưu sản phẩm</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
            {[
              { id: "content", label: "Thông tin & Nội dung", icon: "solar:document-text-line-duotone" },
              { id: "pricing", label: "Thương mại & Bản quyền", icon: "solar:tag-price-line-duotone" },
              { id: "specs", label: "Kỹ thuật & Tương thích", icon: "solar:settings-line-duotone" },
              { id: "features", label: "Tính năng nổi bật", icon: "solar:check-circle-line-duotone" },
              { id: "changelog", label: "Lịch sử cập nhật", icon: "solar:history-line-duotone" },
              { id: "media", label: "Hình ảnh Showcase", icon: "solar:gallery-line-duotone" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEditorTab(tab.id as any)}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 w-full sm:w-auto cursor-pointer",
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
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Tên sản phẩm <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ví dụ: Auto Facebook Bot v1"
                        className="h-9 text-[13px]"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Đường dẫn (Slug) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="flex items-center bg-muted/40 border border-border px-2.5 rounded-md text-[11px] text-muted-foreground select-none font-mono">
                          /products/
                        </div>
                        <Input
                          value={formData.slug}
                          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                          placeholder="auto-facebook-bot-v1"
                          className="h-9 text-[13px] flex-1"
                        />
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Mô tả tóm tắt ngắn về giải pháp..."
                        className="h-16 text-[13px] resize-none"
                      />
                    </div>

                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Nội dung chi tiết & Tài liệu giới thiệu (MDX)</label>
                      <MdxEditor
                        ref={textareaRef}
                        value={formData.content}
                        onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                        onOpenGallery={() => {
                          setGalleryTarget({ type: "content" });
                          setGalleryOpen(true);
                        }}
                        scope={{ formData }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editorTab === "pricing" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground pb-2 border-b">Thông tin phân phối & Giá bán</h3>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Giá bán gốc (Regular Price)</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                        className="h-9 text-[13px]"
                        placeholder="Ví dụ: 99 hoặc 2500000"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Giá khuyến mãi (Sale Price)</label>
                      <Input
                        type="number"
                        value={formData.salePrice ?? ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, salePrice: e.target.value ? parseInt(e.target.value) : null }))}
                        className="h-9 text-[13px]"
                        placeholder="Để trống nếu không giảm giá"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Đồng tiền giao dịch (Currency)</label>
                      <Select
                        value={formData.currency}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, currency: val }))}
                      >
                        <SelectTrigger className="h-9 text-[13px] w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD" className="text-[13px]">
                            <span className="flex items-center gap-2">
                              <Icon icon="solar:dollar-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                              <span>USD ($)</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="VND" className="text-[13px]">
                            <span className="flex items-center gap-2">
                              <Icon icon="solar:wallet-money-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                              <span>VND (đ)</span>
                            </span>
                          </SelectItem>
                          <SelectItem value="EUR" className="text-[13px]">
                            <span className="flex items-center gap-2">
                              <Icon icon="solar:euro-line-duotone" className="size-3.5 shrink-0 text-purple-500" />
                              <span>EUR (€)</span>
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Số tháng hỗ trợ kỹ thuật đi kèm</label>
                      <Input
                        type="number"
                        value={formData.supportMonths}
                        onChange={(e) => setFormData((prev) => ({ ...prev, supportMonths: parseInt(e.target.value) || 0 }))}
                        className="h-9 text-[13px]"
                        placeholder="Ví dụ: 6 hoặc 12"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editorTab === "specs" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground pb-2 border-b">Thông số kỹ thuật & Tương thích</h3>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                      <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Phiên bản hiện hành (Version)</label>
                        <Input
                          value={formData.version}
                          onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                          className="h-9 text-[13px]"
                          placeholder="Ví dụ: 1.0.0"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Dung lượng tệp tin (File Size)</label>
                        <Input
                          value={formData.fileSize}
                          onChange={(e) => setFormData((prev) => ({ ...prev, fileSize: e.target.value }))}
                          className="h-9 text-[13px]"
                          placeholder="Ví dụ: 12.4 MB hoặc 85 KB"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground pb-2 border-b">Yêu cầu môi trường / Tương thích</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                      <Input
                        value={newCompatibility}
                        onChange={(e) => setNewCompatibility(e.target.value)}
                        placeholder="Ví dụ: Node.js v20+, Next.js 16, Chrome Extension V3"
                        className="h-9 flex-1 text-[13px]"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompatibility())}
                      />
                      <Button
                        variant="outline"
                        type="button"
                        onClick={addCompatibility}
                        className="h-9 cursor-pointer shrink-0 sm:w-20"
                      >
                        Thêm
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.compatibility.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">Chưa cấu hình thông số tương thích</span>
                      ) : (
                        formData.compatibility.map((c) => (
                          <Badge key={c} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg">
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() => removeCompatibility(c)}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Icon icon="solar:close-circle-line-duotone" className="size-3.5" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground pb-2 border-b">Liên kết tài nguyên</h3>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Link chạy Demo trực tiếp (Live Demo URL)</label>
                        <Input
                          value={formData.demoUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, demoUrl: e.target.value }))}
                          className="h-9 text-[13px]"
                          placeholder="https://demo.vanistudio.com/my-tool"
                        />
                      </div>

                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Link Github Showcase (Github URL)</label>
                        <Input
                          value={formData.githubUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                          className="h-9 text-[13px]"
                          placeholder="https://github.com/vanixjnk/my-tool"
                        />
                      </div>

                      <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-foreground">Link Tải về / Mua hàng (Download/Purchase URL)</label>
                        <Input
                          value={formData.downloadUrl}
                          onChange={(e) => setFormData((prev) => ({ ...prev, downloadUrl: e.target.value }))}
                          className="h-9 text-[13px]"
                          placeholder="https://gumroad.com/l/my-tool"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editorTab === "features" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Các tính năng chính của giải pháp</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Liệt kê các điểm mạnh nổi bật của sản phẩm.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={addFeature}
                      className="gap-1.5 cursor-pointer h-9 px-3 text-xs"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                      <span>Thêm tính năng</span>
                    </Button>
                  </div>

                  {formData.features.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs flex flex-col items-center justify-center gap-2 bg-card/10">
                      <Icon icon="solar:info-circle-line-duotone" className="size-8 text-muted-foreground/50" />
                      <span className="font-medium">Chưa thiết lập tính năng nào cho sản phẩm này.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="p-4 border border-border/80 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all flex flex-col gap-3.5 relative group"
                        >
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-lg flex items-center justify-center bg-vanixjnk/10 border border-vanixjnk/20 text-vanixjnk">
                                <Icon icon={feat.icon || "solar:star-line-duotone"} className="size-3.5" />
                              </div>
                              <span className="text-xs font-bold text-foreground">Tính năng #{idx + 1}</span>
                            </div>
                            <Button
                              type="button"
                              variant="danger"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => removeFeature(idx)}
                              title="Xóa tính năng"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Tên tính năng</label>
                              <Input
                                value={feat.name}
                                onChange={(e) => updateFeature(idx, "name", e.target.value)}
                                placeholder="Ví dụ: Tối ưu SEO"
                                className="h-9 text-[13px]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Biểu tượng (Icon)</label>
                              <div className="flex items-center gap-1.5">
                                <Input
                                  value={feat.icon || ""}
                                  onChange={(e) => updateFeature(idx, "icon", e.target.value)}
                                  placeholder="Ví dụ: solar:star-line-duotone"
                                  className="h-9 text-[13px] flex-1"
                                />
                                <IconPicker
                                  value={feat.icon || "solar:star-line-duotone"}
                                  onChange={(val) => updateFeature(idx, "icon", val)}
                                  trigger={
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      title="Chọn biểu tượng"
                                      className="size-9 rounded-lg shrink-0 cursor-pointer"
                                    >
                                      <Icon icon="solar:star-line-duotone" className="size-4 text-vanixjnk" />
                                    </Button>
                                  }
                                />
                              </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Mô tả chi tiết</label>
                              <Input
                                value={feat.description || ""}
                                onChange={(e) => updateFeature(idx, "description", e.target.value)}
                                placeholder="Mô tả sơ lược về hoạt động..."
                                className="h-9 text-[13px]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editorTab === "changelog" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Nhật ký cập nhật (Changelog)</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Theo dõi lịch sử phát hành và thay đổi qua các phiên bản.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={addChangelog}
                      className="gap-1.5 cursor-pointer h-9 px-3 text-xs"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                      <span>Thêm phiên bản</span>
                    </Button>
                  </div>
                  {formData.changelog.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs flex flex-col items-center justify-center gap-2 bg-card/10">
                      <Icon icon="solar:history-line-duotone" className="size-8 text-muted-foreground/50" />
                      <span className="font-medium">Chưa ghi nhận bản cập nhật nào cho sản phẩm này.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.changelog.map((log, logIdx) => (
                        <div
                          key={logIdx}
                          className="p-4 border border-border/88 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all flex flex-col gap-3.5 relative group"
                        >
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-lg flex items-center justify-center bg-vanixjnk/10 border border-vanixjnk/20 text-vanixjnk">
                                <Icon icon="solar:history-line-duotone" className="size-3.5" />
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                Phiên bản {log.version || `#${logIdx + 1}`}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="danger"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => removeChangelog(logIdx)}
                              title="Xóa phiên bản changelog"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Phiên bản</label>
                              <Input
                                value={log.version}
                                onChange={(e) => updateChangelogHeader(logIdx, "version", e.target.value)}
                                placeholder="Ví dụ: v1.0.1"
                                className="h-9 text-[13px]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Ngày cập nhật</label>
                              <DateTimePicker
                                value={log.date ? new Date(log.date) : null}
                                onChange={(date) => {
                                  const dateStr = date ? date.toISOString().split("T")[0] : "";
                                  updateChangelogHeader(logIdx, "date", dateStr);
                                }}
                                className="h-9 w-full text-[13px]"
                                placeholder="Chọn ngày cập nhật..."
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-foreground">Tiêu đề phụ</label>
                              <Input
                                value={log.title || ""}
                                onChange={(e) => updateChangelogHeader(logIdx, "title", e.target.value)}
                                placeholder="Bản vá bảo mật, v.v."
                                className="h-9 text-[13px]"
                              />
                            </div>
                          </div>

                          <div className="space-y-2.5 border-t border-border/40 pt-3.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-foreground">Các dòng thay đổi (Changes)</label>
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => addChangelogLine(logIdx)}
                                className="gap-1 h-8 px-2.5 text-[11px] cursor-pointer"
                              >
                                <Icon icon="solar:add-circle-line-duotone" className="text-sm text-emerald-500" />
                                <span>Thêm dòng</span>
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {log.changes.length === 0 ? (
                                <span className="text-[11px] text-muted-foreground italic">Chưa có mô tả thay đổi nào.</span>
                              ) : (
                                log.changes.map((line, lineIdx) => (
                                  <div key={lineIdx} className="flex gap-2 items-center">
                                    <span className="text-xs text-muted-foreground font-mono w-4 shrink-0">#{lineIdx + 1}</span>
                                    <Input
                                      value={line}
                                      onChange={(e) => updateChangelogLine(logIdx, lineIdx, e.target.value)}
                                      placeholder="Nêu chi tiết những gì thay đổi hoặc được tối ưu..."
                                      className="h-9 flex-1 text-[13px]"
                                    />
                                    <Button
                                      type="button"
                                      variant="danger"
                                      size="icon-sm"
                                      onClick={() => removeChangelogLine(logIdx, lineIdx)}
                                      className="size-9 shrink-0 cursor-pointer animate-none border border-border/40 hover:bg-red-500/10 hover:border-red-500/30"
                                    >
                                      <Icon icon="solar:close-circle-line-duotone" className="size-4 text-red-500" />
                                    </Button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editorTab === "media" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-sm font-bold text-foreground">Bộ ảnh Screenshots minh họa sản phẩm (Gallery)</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          setGalleryTarget({ type: "gallery" });
                          setGalleryOpen(true);
                        }}
                        className="gap-1.5 cursor-pointer h-9 px-3 text-xs"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                        <span>Thêm ảnh minh họa</span>
                      </Button>
                    </div>

                    {formData.gallery.length === 0 ? (
                      <div className="py-12 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs flex flex-col items-center justify-center gap-2 bg-card/10">
                        <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-8 text-muted-foreground/50" />
                        <span className="font-medium">Chưa chọn ảnh minh họa nào cho sản phẩm.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {formData.gallery.map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="aspect-video rounded-lg border border-border bg-card relative group overflow-hidden shadow-xs"
                          >
                            <img src={imgUrl} alt={`Gallery item ${idx}`} className="size-full object-cover" />
                            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                type="button"
                                variant="danger"
                                size="icon-sm"
                                onClick={() => removeGalleryImage(idx)}
                                title="Xóa ảnh"
                                className="size-8 cursor-pointer"
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

            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:settings-line-duotone" className="size-4 text-vanixjnk" />
                  Trạng thái & Xuất bản
                </h4>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Trạng thái phát hành</label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="h-9 text-[13px] w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:check-circle-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                          <span>Hoạt động (Active)</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="draft" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:file-text-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                          <span>Bản nháp (Draft)</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="archived" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:archive-line-duotone" className="size-3.5 shrink-0 text-indigo-500" />
                          <span>Lưu trữ (Archived)</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:folder-with-files-line-duotone" className="size-4 text-vanixjnk" />
                  Cấu hình mở rộng
                </h4>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-bold text-foreground">Sản phẩm nổi bật</span>
                    <span className="text-[10px] text-muted-foreground">Ghim lên tiêu điểm trang chủ.</span>
                  </div>
                  <Switch
                    checked={formData.isFeatured || false}
                    onCheckedChange={(val) => setFormData((prev) => ({ ...prev, isFeatured: val }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Loại sản phẩm</label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger className="h-9 text-[13px] w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="source_code" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:code-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                          <span>Mã nguồn</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="tool" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:tuning-line-duotone" className="size-3.5 shrink-0 text-indigo-500" />
                          <span>Công cụ / Tool</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="app" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:smartphone-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                          <span>Ứng dụng / App</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="bot" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:cpu-line-duotone" className="size-3.5 shrink-0 text-purple-500" />
                          <span>Robot / Bot</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="extension" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:widget-2-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                          <span>Tiện ích mở rộng</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Nhãn huy hiệu nổi bật (Badge)</label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    className="h-9 text-[13px]"
                    placeholder="Ví dụ: HOT, NEW, SALE, BETA"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-foreground">Bản quyền giấy phép (License)</label>
                  <Select
                    value={formData.licenseType}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, licenseType: val }))}
                  >
                    <SelectTrigger className="h-9 text-[13px] w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:user-rounded-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                          <span>Single License (Sử dụng đơn)</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="extended" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:users-group-two-rounded-line-duotone" className="size-3.5 shrink-0 text-indigo-500" />
                          <span>Extended License (Sử dụng mở rộng)</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="subscription" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:calendar-mark-line-duotone" className="size-3.5 shrink-0 text-purple-500" />
                          <span>Subscription License (Định kỳ)</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="free" className="text-[13px]">
                        <span className="flex items-center gap-2">
                          <Icon icon="solar:gift-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                          <span>Free / Open-Source (Miễn phí)</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:gallery-line-duotone" className="size-4 text-vanixjnk" />
                  Ảnh đại diện sản phẩm (Thumbnail)
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
                      setGalleryTarget({ type: "thumbnail" });
                      setGalleryOpen(true);
                    }}
                    className="size-9 flex items-center justify-center bg-vanixjnk/10 text-vanixjnk border border-vanixjnk/20 rounded-md hover:bg-vanixjnk/20 transition-colors shrink-0 cursor-pointer"
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
                      className="flex flex-col items-start gap-1 p-2 rounded-lg bg-background border border-border/60 hover:border-vanixjnk/40 hover:bg-vanixjnk/5 transition-all duration-200 group text-left w-full shadow-2xs cursor-pointer"
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
        onSelect={handleSelectImage}
      />
    </div>
  );
}
