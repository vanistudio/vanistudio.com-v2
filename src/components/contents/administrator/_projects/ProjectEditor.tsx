"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { toast } from "sonner";
import { MdxEditor, insertMdxAtCursor } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { IconPicker } from "@/components/vanixjnk/icon-picker";
import { DateTimePicker } from "@/components/vanixjnk/date-time-picker";

interface ProjectEditorProps {
  mode: "create" | "edit";
  initialId?: string;
}

export default function ProjectEditor({ mode, initialId }: ProjectEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    content: "",
    thumbnail: "",
    difficulty: 3,
    projectType: "Personal Project",
    role: "Fullstack Developer",
    status: "Hoàn thành",
    startDate: null as string | null,
    endDate: null as string | null,
    serviceId: null as string | null,
    mediaGallery: [] as { url: string; caption?: string | null; type: "image" | "video" }[],
    metrics: [] as { label: string; value: string; icon?: string | null }[],
    links: [] as { label: string; url: string; type: "live" | "github" | "figma" | "youtube" | "docs" | "other" }[],
    highlights: [] as { title: string; description: string; image?: string | null }[],
    team: [] as { name: string; role: string; avatar?: string | null; profileUrl?: string | null }[],
    testimonials: [] as { content: string; author: string; role: string; avatar?: string | null }[],
  });

  const [editorTab, setEditorTab] = useState<"content" | "media" | "metrics" | "highlights" | "testimonials">("content");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<{ type: "thumbnail" | "gallery" | "member" | "testimonial" | "highlight"; index?: number }>({ type: "thumbnail" });
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { data: serverProject, isLoading: isLoadingProject, error: loadError } = trpc.administrator.projects.getById.useQuery(
    { id: initialId as string },
    {
      enabled: mode === "edit" && !!initialId,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const { data: servicesList } = trpc.administrator.services.getAll.useQuery(undefined, { refetchOnWindowFocus: false });

  const createMutation = trpc.administrator.projects.create.useMutation();
  const updateMutation = trpc.administrator.projects.update.useMutation();

  useEffect(() => {
    if (serverProject) {
      setFormData({
        name: serverProject.name,
        slug: serverProject.slug,
        description: serverProject.description || "",
        content: serverProject.content,
        thumbnail: serverProject.thumbnail || "",
        difficulty: serverProject.difficulty || 3,
        projectType: serverProject.projectType || "Personal Project",
        role: serverProject.role || "Fullstack Developer",
        status: serverProject.status || "Hoàn thành",
        startDate: serverProject.startDate ? new Date(serverProject.startDate).toISOString().split("T")[0] : null,
        endDate: serverProject.endDate ? new Date(serverProject.endDate).toISOString().split("T")[0] : null,
        serviceId: serverProject.serviceId || null,
        mediaGallery: (serverProject.mediaGallery || []) as any,
        metrics: (serverProject.metrics || []) as any,
        links: (serverProject.links || []) as any,
        highlights: (serverProject.highlights || []) as any,
        team: (serverProject.team || []) as any,
        testimonials: (serverProject.testimonials || []) as any,
      });
    }
  }, [serverProject]);

  useEffect(() => {
    if (loadError) {
      toast.error(loadError.message || "Không thể tải dữ liệu dự án!");
      router.push("/adminPanel/projects");
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
      toast.error("Tên dự án không được để trống!");
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
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
      };

      if (mode === "edit" && initialId) {
        await updateMutation.mutateAsync({
          id: initialId,
          data: payload as any,
        });
        toast.success("Cập nhật dự án thành công!");
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Tạo dự án mới thành công!");
      }
      router.push("/adminPanel/projects");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lưu dự án");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/adminPanel/projects");
  };

  const addMedia = () => {
    setFormData((prev) => ({
      ...prev,
      mediaGallery: [...prev.mediaGallery, { url: "", caption: "", type: "image" }],
    }));
  };

  const removeMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mediaGallery: prev.mediaGallery.filter((_, i) => i !== index),
    }));
  };

  const updateMedia = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.mediaGallery];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, mediaGallery: updated };
    });
  };

  const addMetric = () => {
    setFormData((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { label: "", value: "", icon: "solar:ranking-line-duotone" }],
    }));
  };

  const removeMetric = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index),
    }));
  };

  const updateMetric = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.metrics];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, metrics: updated };
    });
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, { label: "", url: "", type: "live" }],
    }));
  };

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const updateLink = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.links];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, links: updated };
    });
  };

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, { title: "", description: "", image: "" }],
    }));
  };

  const removeHighlight = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const updateHighlight = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.highlights];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, highlights: updated };
    });
  };

  const addMember = () => {
    setFormData((prev) => ({
      ...prev,
      team: [...prev.team, { name: "", role: "", avatar: "", profileUrl: "" }],
    }));
  };

  const removeMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const updateMember = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.team];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, team: updated };
    });
  };

  const addTestimonial = () => {
    setFormData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, { content: "", author: "", role: "", avatar: "" }],
    }));
  };

  const removeTestimonial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
  };

  const updateTestimonial = (index: number, key: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.testimonials];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, testimonials: updated };
    });
  };

  const handleSelectImage = (url: string) => {
    if (galleryTarget.type === "thumbnail") {
      setFormData((prev) => ({ ...prev, thumbnail: url }));
    } else if (galleryTarget.type === "gallery" && galleryTarget.index !== undefined) {
      updateMedia(galleryTarget.index, "url", url);
    } else if (galleryTarget.type === "member" && galleryTarget.index !== undefined) {
      updateMember(galleryTarget.index, "avatar", url);
    } else if (galleryTarget.type === "highlight" && galleryTarget.index !== undefined) {
      updateHighlight(galleryTarget.index, "image", url);
    } else if (galleryTarget.type === "testimonial" && galleryTarget.index !== undefined) {
      updateTestimonial(galleryTarget.index, "avatar", url);
    } else {
      insertAtCursor(`![Image](${url})`);
    }
    setGalleryOpen(false);
  };

  if (mode === "edit" && isLoadingProject) {
    return (
      <div className="flex flex-col w-full flex-1">
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
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
                <Icon icon="solar:folder-open-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Dự án Showcase</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý danh mục các dự án portfolio, thông tin công nghệ và số liệu nổi bật.
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
                  {mode === "edit" ? "Chỉnh sửa dự án" : "Tạo dự án showcase mới"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mode === "edit" ? `Đang thiết lập cấu hình cho: ${formData.name}` : "Điền thông tin chi tiết dự án mới."}
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
                <span>Lưu dự án</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60 w-full sm:w-auto sm:self-start whitespace-nowrap">
            {[
              { id: "content", label: "Nội dung & Thông tin", icon: "solar:document-text-line-duotone" },
              { id: "media", label: "Ảnh & Video", icon: "solar:gallery-line-duotone" },
              { id: "metrics", label: "Số liệu & Liên kết", icon: "solar:ranking-line-duotone" },
              { id: "highlights", label: "Đặc quyền & Đội ngũ", icon: "solar:star-line-duotone" },
              { id: "testimonials", label: "Đánh giá của đối tác", icon: "solar:chat-square-line-duotone" },
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
                      Tên dự án <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ví dụ: VaniStudio v2 Website"
                      className="h-9"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">
                      Đường dẫn URL thân thiện (Slug) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center bg-muted/40 border border-border/80 px-2.5 rounded-md text-[11px] text-muted-foreground select-none font-mono">
                        /projects/
                      </div>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="vanistudio-v2-website"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Loại dự án</label>
                      <Input
                        value={formData.projectType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, projectType: e.target.value }))}
                        placeholder="e.g. Personal Project, Commission"
                        className="h-9"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Vai trò chính</label>
                      <Input
                        value={formData.role}
                        onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g. Lead Developer, Architect"
                        className="h-9"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Độ khó dự án</label>
                      <Select
                        value={formData.difficulty.toString()}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, difficulty: parseInt(val, 10) }))}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Chọn độ khó..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:star-bold" className="size-3.5 text-emerald-500 shrink-0" />
                              <span>Dễ (1★)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="3">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5 shrink-0">
                                <Icon icon="solar:star-bold" className="size-3.5 text-amber-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-amber-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-amber-500" />
                              </div>
                              <span>Trung bình (3★)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="4">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5 shrink-0">
                                <Icon icon="solar:star-bold" className="size-3.5 text-orange-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-orange-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-orange-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-orange-500" />
                              </div>
                              <span>Khó (4★)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="5">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5 shrink-0">
                                <Icon icon="solar:star-bold" className="size-3.5 text-rose-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-rose-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-rose-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-rose-500" />
                                <Icon icon="solar:star-bold" className="size-3.5 text-rose-500" />
                              </div>
                              <span>Cực khó (5★)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Ngày bắt đầu</label>
                      <DateTimePicker
                        value={formData.startDate}
                        onChange={(date) => setFormData((prev) => ({ ...prev, startDate: date ? date.toISOString() : null }))}
                        placeholder="Chọn ngày bắt đầu..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Ngày hoàn thành</label>
                      <DateTimePicker
                        value={formData.endDate}
                        onChange={(date) => setFormData((prev) => ({ ...prev, endDate: date ? date.toISOString() : null }))}
                        placeholder="Chọn ngày hoàn thành..."
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground">Trạng thái</label>
                      <Select
                        value={formData.status}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bản nháp">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:document-text-line-duotone" className="size-3.5 text-muted-foreground shrink-0" />
                              <span>Bản nháp</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Đang phát triển">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:refresh-line-duotone" className="size-3.5 text-amber-500 shrink-0" />
                              <span>Đang phát triển</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Hoàn thành">
                            <div className="flex items-center gap-2">
                              <Icon icon="solar:check-circle-line-duotone" className="size-3.5 text-emerald-500 shrink-0" />
                              <span>Hoàn thành</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Dịch vụ liên kết</label>
                    <Select
                      value={formData.serviceId || "none"}
                      onValueChange={(val) => setFormData((prev) => ({ ...prev, serviceId: val === "none" ? null : val }))}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Chọn dịch vụ liên quan..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <div className="flex items-center gap-2">
                            <Icon icon="solar:close-circle-line-duotone" className="size-3.5 text-muted-foreground shrink-0" />
                            <span>Không liên kết</span>
                          </div>
                        </SelectItem>
                        {servicesList?.map((service) => {
                          const icon = service.serviceType?.icon || "solar:case-minimalistic-line-duotone";
                          const colorClass = service.serviceType?.color || "text-indigo-500";
                          return (
                            <SelectItem key={service.id} value={service.id}>
                              <div className="flex items-center gap-2">
                                <Icon icon={icon} className={cn("size-3.5 shrink-0", colorClass)} />
                                <span>{service.name}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-foreground">Mô tả ngắn</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Tóm tắt ngắn gọn dự án hiển thị trên thẻ showcase..."
                      className="h-16 resize-none"
                    />
                  </div>

                  <MdxEditor
                    ref={textareaRef}
                    value={formData.content}
                    onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
                    onOpenGallery={() => {
                      setGalleryTarget({ type: "thumbnail" });
                      setGalleryOpen(true);
                    }}
                    scope={{ formData }}
                  />
                </div>
              )}

              {editorTab === "media" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Bộ sưu tập hình ảnh & video</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Các hình ảnh chụp màn hình, video demo về sản phẩm.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={addMedia}
                      className="gap-1.5"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                      <span>Thêm đa phương tiện</span>
                    </Button>
                  </div>

                  {formData.mediaGallery.length === 0 ? (
                    <div className="py-12 text-center border-2 border-dashed border-border/85 rounded-2xl text-muted-foreground/60 text-xs flex flex-col items-center justify-center gap-2 bg-background/50">
                      <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-8 text-muted-foreground/40" />
                      <span>Chưa có tệp đa phương tiện nào trong bộ sưu tập.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.mediaGallery.map((med, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-3 border border-border/60 rounded-2xl bg-muted/5 hover:bg-muted/10 hover:border-border transition-all duration-300 relative group shadow-sm"
                        >
                          <div className="w-32 flex flex-col gap-2 shrink-0">
                            <div
                              className="aspect-video w-full rounded-xl overflow-hidden border border-border/65 bg-background/50 relative group/thumb cursor-pointer"
                              onClick={() => {
                                setGalleryTarget({ type: "gallery", index: idx });
                                setGalleryOpen(true);
                              }}
                              title="Chọn từ thư viện"
                            >
                              {med.url ? (
                                med.type === "image" ? (
                                  <img
                                    src={med.url}
                                    alt="Preview"
                                    className="size-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="size-full flex flex-col items-center justify-center bg-zinc-950">
                                    <Icon icon="solar:videocamera-record-line-duotone" className="size-6 text-rose-500" />
                                    <span className="text-[9px] text-muted-foreground mt-1">Video</span>
                                  </div>
                                )
                              ) : (
                                <div className="size-full flex flex-col items-center justify-center text-muted-foreground/40 hover:text-vanixjnk transition-colors">
                                  <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-5" />
                                  <span className="text-[9px] mt-1 font-medium">Chưa có ảnh</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                <Icon icon="solar:gallery-send-line-duotone" className="text-white text-sm" />
                                <span className="text-[10px] text-white font-medium">Chọn ảnh</span>
                              </div>
                            </div>

                            <Select
                              value={med.type}
                              onValueChange={(val: any) => updateMedia(idx, "type", val)}
                            >
                              <SelectTrigger className="h-7 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="image">
                                  <div className="flex items-center gap-1.5">
                                    <Icon icon="solar:gallery-line-duotone" className="size-3.5 text-sky-500 shrink-0" />
                                    <span>Ảnh</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="video">
                                  <div className="flex items-center gap-1.5">
                                    <Icon icon="solar:videocamera-record-line-duotone" className="size-3.5 text-rose-500 shrink-0" />
                                    <span>Video</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex-1 flex flex-col gap-2 justify-between">
                            <div className="space-y-1.5">
                              <div className="relative flex items-center">
                                <Icon icon="solar:link-round-angle-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-8 pl-8"
                                  placeholder="URL đa phương tiện..."
                                  value={med.url}
                                  onChange={(e) => updateMedia(idx, "url", e.target.value)}
                                />
                              </div>
                              <div className="relative flex items-center">
                                <Icon icon="solar:document-text-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-8 pl-8"
                                  placeholder="Chú thích ngắn gọn (caption)..."
                                  value={med.caption || ""}
                                  onChange={(e) => updateMedia(idx, "caption", e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="text-[10px] text-muted-foreground/60 flex items-center justify-between border-t border-border/20 pt-1.5 mt-0.5">
                              <span>Đa phương tiện #{idx + 1}</span>
                              <Button
                                type="button"
                                variant="danger"
                                size="icon-sm"
                                onClick={() => removeMedia(idx)}
                                title="Xóa tệp"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {editorTab === "metrics" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Số liệu hiệu quả thực tế</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Thống kê kết quả đạt được của dự án (e.g. 50k+ Users, -30% Latency).</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={addMetric}
                        className="gap-1.5"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                        <span>Thêm số liệu</span>
                      </Button>
                    </div>
                    {formData.metrics.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-border/80 rounded-2xl text-muted-foreground/60 text-xs flex flex-col items-center justify-center gap-2 bg-background/50">
                        <Icon icon="solar:ranking-line-duotone" className="size-7 text-muted-foreground/40" />
                        <span>Chưa thêm số liệu thống kê nào.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.metrics.map((met, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 border border-border/60 rounded-2xl bg-muted/5 hover:bg-muted/10 hover:border-border transition-all duration-300 relative group shadow-sm"
                          >
                            <div className="shrink-0">
                              <IconPicker
                                value={met.icon || "solar:ranking-line-duotone"}
                                onChange={(val) => updateMetric(idx, "icon", val)}
                                trigger={
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-9"
                                    title="Chọn biểu tượng"
                                  >
                                    <Icon icon={met.icon || "solar:ranking-line-duotone"} className="text-base text-vanixjnk" />
                                  </Button>
                                }
                              />
                            </div>
                            <div className="flex-1 grid grid-cols-1 gap-2">
                              <div className="relative flex items-center">
                                <Icon icon="solar:document-text-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-8 pl-8"
                                  placeholder="Nhãn (e.g. Lượt tải về)..."
                                  value={met.label}
                                  onChange={(e) => updateMetric(idx, "label", e.target.value)}
                                />
                              </div>
                              <div className="relative flex items-center">
                                <Icon icon="solar:chart-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-8 pl-8"
                                  placeholder="Giá trị (e.g. 50,000+)..."
                                  value={met.value}
                                  onChange={(e) => updateMetric(idx, "value", e.target.value)}
                                />
                              </div>
                              <div className="relative flex items-center">
                                <Icon icon="solar:star-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-8 pl-8"
                                  placeholder="solar:ranking-line-duotone"
                                  value={met.icon || ""}
                                  onChange={(e) => updateMetric(idx, "icon", e.target.value)}
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="danger"
                              size="icon-sm"
                              className="shrink-0"
                              onClick={() => removeMetric(idx)}
                              title="Xóa số liệu"
                            >
                              <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Liên kết tài nguyên dự án</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Liên kết đến Website trực tiếp, Repository Github, hay tài liệu.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={addLink}
                        className="gap-1.5"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                        <span>Thêm liên kết</span>
                      </Button>
                    </div>
                    {formData.links.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-border/80 rounded-2xl text-muted-foreground/60 text-xs flex flex-col items-center justify-center gap-2 bg-background/50">
                        <Icon icon="solar:link-round-line-duotone" className="size-7 text-muted-foreground/40" />
                        <span>Chưa thêm liên kết ngoài nào.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.links.map((lnk, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 p-3 border border-border/60 rounded-2xl bg-muted/5 hover:bg-muted/10 hover:border-border transition-all duration-300 relative group shadow-sm"
                          >
                            <div className="w-[110px] shrink-0 flex flex-col justify-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground/60 font-semibold px-1">Loại liên kết</span>
                              <Select
                                value={lnk.type}
                                onValueChange={(val: any) => updateLink(idx, "type", val)}
                              >
                                <SelectTrigger className="h-8 w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="live">
                                    <div className="flex items-center gap-1.5">
                                      <Icon icon="solar:globus-line-duotone" className="size-3.5 text-emerald-500 shrink-0" />
                                      <span>Live</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="github">
                                    <div className="flex items-center gap-1.5">
                                      <Icon icon="simple-icons:github" className="size-3.5 text-foreground shrink-0" />
                                      <span>Github</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="figma">
                                    <div className="flex items-center gap-1.5">
                                      <Icon icon="simple-icons:figma" className="size-3.5 text-pink-500 shrink-0" />
                                      <span>Figma</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="youtube">
                                    <div className="flex items-center gap-1.5">
                                      <Icon icon="simple-icons:youtube" className="size-3.5 text-red-500 shrink-0" />
                                      <span>Youtube</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="docs">
                                    <div className="flex items-center gap-1.5">
                                      <Icon icon="solar:document-text-line-duotone" className="size-3.5 text-blue-500 shrink-0" />
                                      <span>Tài liệu</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="other">
                                    <div className="flex items-center gap-1.5">
                                      <Icon icon="solar:link-round-angle-line-duotone" className="size-3.5 text-muted-foreground shrink-0" />
                                      <span>Khác</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1 flex flex-col gap-2 justify-center">
                              <div className="relative flex items-center">
                                <Icon icon="solar:document-text-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-8 pl-8"
                                  placeholder="Tên liên kết (e.g. Website trực tiếp)..."
                                  value={lnk.label}
                                  onChange={(e) => updateLink(idx, "label", e.target.value)}
                                />
                              </div>
                              <div className="relative flex items-center">
                                <Icon icon="solar:link-round-angle-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-8 pl-8"
                                  placeholder="Đường dẫn URL (https://...)"
                                  value={lnk.url}
                                  onChange={(e) => updateLink(idx, "url", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col justify-end">
                              <Button
                                type="button"
                                variant="danger"
                                size="icon-sm"
                                className="shrink-0 mb-0.5"
                                onClick={() => removeLink(idx)}
                                title="Xóa liên kết"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {editorTab === "highlights" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Điểm nhấn kiến trúc / công nghệ</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Những giải pháp hoặc tính năng kỹ thuật nổi bật được triển khai.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={addHighlight}
                        className="gap-1.5"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                        <span>Thêm điểm nhấn</span>
                      </Button>
                    </div>

                    {formData.highlights.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-border/80 rounded-2xl text-muted-foreground/60 text-xs flex flex-col items-center justify-center gap-2 bg-background/50">
                        <Icon icon="solar:star-line-duotone" className="size-7 text-muted-foreground/40" />
                        <span>Chưa thêm điểm nhấn kiến trúc nào.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.highlights.map((high, idx) => (
                          <div
                            key={idx}
                            className="flex gap-4 p-3 border border-border/60 rounded-2xl bg-muted/5 hover:bg-muted/10 hover:border-border transition-all duration-300 relative group shadow-sm"
                          >
                            <div className="w-32 flex flex-col gap-2 shrink-0 justify-center">
                              <span className="text-[10px] text-muted-foreground/60 font-semibold px-1">Ảnh minh họa</span>
                              <div
                                className="aspect-video w-full rounded-xl overflow-hidden border border-border/65 bg-background/50 relative group/thumb cursor-pointer"
                                onClick={() => {
                                  setGalleryTarget({ type: "highlight", index: idx });
                                  setGalleryOpen(true);
                                }}
                                title="Chọn từ thư viện"
                              >
                                {high.image ? (
                                  <img
                                    src={high.image}
                                    alt="Highlight Preview"
                                    className="size-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="size-full flex flex-col items-center justify-center text-muted-foreground/40 hover:text-vanixjnk transition-colors">
                                    <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-5" />
                                    <span className="text-[9px] mt-1 font-medium">Chưa có ảnh</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                  <Icon icon="solar:gallery-send-line-duotone" className="text-white text-sm" />
                                  <span className="text-[10px] text-white font-medium">Chọn ảnh</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-muted-foreground/50 text-center font-mono truncate px-1" title={high.image || ""}>
                                {high.image ? high.image.split("/").pop() : "Trống"}
                              </span>
                            </div>
                            <div className="flex-1 flex flex-col gap-2 justify-between">
                              <div className="space-y-1.5">
                                <div className="relative flex items-center">
                                  <Icon icon="solar:star-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                  <Input
                                    className="h-8 pl-8"
                                    placeholder="Tiêu đề (e.g. Cache Redis)..."
                                    value={high.title}
                                    onChange={(e) => updateHighlight(idx, "title", e.target.value)}
                                  />
                                </div>
                                <div className="relative flex items-start">
                                  <Icon icon="solar:document-text-line-duotone" className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                                  <Textarea
                                    className="h-14 pl-8 py-2"
                                    placeholder="Mô tả ngắn về giải pháp..."
                                    value={high.description}
                                    onChange={(e) => updateHighlight(idx, "description", e.target.value)}
                                  />
                                </div>
                                <div className="relative flex items-center">
                                  <Icon icon="solar:link-round-angle-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                  <Input
                                    className="h-7 pl-8"
                                    placeholder="Đường dẫn ảnh trực tiếp..."
                                    value={high.image || ""}
                                    onChange={(e) => updateHighlight(idx, "image", e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="text-[10px] text-muted-foreground/60 flex items-center justify-between border-t border-border/20 pt-1.5 mt-0.5">
                                <span>Điểm nhấn #{idx + 1}</span>
                                <Button
                                  type="button"
                                  variant="danger"
                                  size="icon-sm"
                                  onClick={() => removeHighlight(idx)}
                                  title="Xóa điểm nhấn"
                                >
                                  <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Đội ngũ tham gia thực hiện</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Danh sách các thành viên đóng góp vào dự án này.</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={addMember}
                        className="gap-1.5"
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                        <span>Thêm thành viên</span>
                      </Button>
                    </div>
                    {formData.team.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-border/80 rounded-2xl text-muted-foreground/60 text-xs flex flex-col items-center justify-center gap-2 bg-background/50">
                        <Icon icon="solar:users-group-two-rounded-line-duotone" className="size-7 text-muted-foreground/40" />
                        <span>Chưa thêm thành viên nào.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formData.team.map((mem, idx) => (
                          <div
                            key={idx}
                            className="flex gap-4 p-3 border border-border/60 rounded-2xl bg-muted/5 hover:bg-muted/10 hover:border-border transition-all duration-300 relative group shadow-sm animate-in fade-in-50"
                          >
                            <div className="w-20 flex flex-col items-center gap-1.5 shrink-0 self-center">
                              <span className="text-[9px] text-muted-foreground/60 font-semibold text-center block">Ảnh đại diện</span>
                              <div
                                className="size-16 rounded-full overflow-hidden border border-border/65 bg-background/50 relative group/avatar cursor-pointer shadow-inner"
                                onClick={() => {
                                  setGalleryTarget({ type: "member", index: idx });
                                  setGalleryOpen(true);
                                }}
                                title="Chọn từ thư viện"
                              >
                                {mem.avatar ? (
                                  <img
                                    src={mem.avatar}
                                    alt="Avatar Preview"
                                    className="size-full object-cover group-hover/avatar:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="size-full flex flex-col items-center justify-center text-muted-foreground/40 hover:text-vanixjnk transition-colors">
                                    <Icon icon="solar:user-circle-line-duotone" className="size-6" />
                                    <span className="text-[8px] mt-0.5 font-medium">Chọn</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                  <Icon icon="solar:gallery-send-line-duotone" className="text-white text-xs" />
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2 justify-between">
                              <div className="space-y-1.5">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="relative flex items-center">
                                    <Icon icon="solar:user-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                    <Input
                                      className="h-8 pl-8"
                                      placeholder="Họ tên..."
                                      value={mem.name}
                                      onChange={(e) => updateMember(idx, "name", e.target.value)}
                                    />
                                  </div>
                                  <div className="relative flex items-center">
                                    <Icon icon="solar:case-minimalistic-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                    <Input
                                      className="h-8 pl-8"
                                      placeholder="Vai trò..."
                                      value={mem.role}
                                      onChange={(e) => updateMember(idx, "role", e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="relative flex items-center">
                                  <Icon icon="solar:link-round-angle-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                  <Input
                                    className="h-7 pl-8"
                                    placeholder="Link ảnh đại diện..."
                                    value={mem.avatar || ""}
                                    onChange={(e) => updateMember(idx, "avatar", e.target.value)}
                                  />
                                </div>
                                <div className="relative flex items-center">
                                  <Icon icon="solar:globus-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                  <Input
                                    className="h-7 pl-8"
                                    placeholder="Profile (GitHub, LinkedIn...)..."
                                    value={mem.profileUrl || ""}
                                    onChange={(e) => updateMember(idx, "profileUrl", e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="text-[10px] text-muted-foreground/60 flex items-center justify-between border-t border-border/20 pt-1.5 mt-0.5">
                                <span>Thành viên #{idx + 1}</span>
                                <Button
                                  type="button"
                                  variant="danger"
                                  size="icon-sm"
                                  onClick={() => removeMember(idx)}
                                  title="Xóa thành viên"
                                >
                                  <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {editorTab === "testimonials" && (
                <div className="space-y-4 animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Ý kiến nhận xét từ phía khách hàng / đối tác</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Lời nhận xét trực quan, thông tin người đánh giá và avatar đại diện.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={addTestimonial}
                      className="gap-1.5"
                    >
                      <Icon icon="solar:add-circle-line-duotone" className="text-base text-emerald-500" />
                      <span>Thêm nhận xét</span>
                    </Button>
                  </div>
                  {formData.testimonials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border/80 rounded-2xl bg-muted/5 text-center">
                      <div className="size-12 rounded-full bg-muted/15 flex items-center justify-center text-muted-foreground/50 mb-3">
                        <Icon icon="solar:chat-square-line-duotone" className="size-6" />
                      </div>
                      <span className="text-xs font-bold text-foreground">Chưa có nhận xét nào</span>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[280px]">
                        Nhấn nút phía trên để thêm các ý kiến phản hồi & đánh giá của khách hàng/đối tác về dự án.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {formData.testimonials.map((t, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-4 border border-border/60 rounded-2xl bg-muted/5 hover:bg-muted/10 hover:border-border transition-all duration-300 relative group shadow-sm"
                        >
                          <div className="w-20 flex flex-col items-center gap-1.5 shrink-0 self-center">
                            <span className="text-[9px] text-muted-foreground/60 font-semibold text-center block">Ảnh đại diện</span>
                            <div
                              className="size-16 rounded-full overflow-hidden border border-border/65 bg-background/50 relative group/avatar cursor-pointer shadow-inner"
                              onClick={() => {
                                setGalleryTarget({ type: "testimonial", index: idx });
                                setGalleryOpen(true);
                              }}
                              title="Chọn từ thư viện"
                            >
                              {t.avatar ? (
                                <img
                                  src={t.avatar}
                                  alt="Partner Avatar"
                                  className="size-full object-cover group-hover/avatar:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="size-full flex flex-col items-center justify-center text-muted-foreground/40 hover:text-vanixjnk transition-colors">
                                  <Icon icon="solar:user-circle-line-duotone" className="size-6" />
                                  <span className="text-[8px] mt-0.5 font-medium">Chọn</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                <Icon icon="solar:gallery-send-line-duotone" className="text-white text-xs" />
                              </div>
                            </div>
                            <span className="text-[8px] text-muted-foreground/40 text-center font-mono truncate w-full px-1" title={t.avatar || ""}>
                              {t.avatar ? t.avatar.split("/").pop() : "Trống"}
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col gap-2 justify-between">
                            <div className="space-y-1.5">
                              <div className="relative flex items-start">
                                <Icon icon="solar:chat-square-line-duotone" className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                                <Textarea
                                  className="h-14 pl-8 py-2"
                                  placeholder="Nội dung nhận xét: 'Dự án hoàn thành tốt, đội ngũ chuyên nghiệp...'"
                                  value={t.content}
                                  onChange={(e) => updateTestimonial(idx, "content", e.target.value)}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="relative flex items-center">
                                  <Icon icon="solar:user-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                  <Input
                                    className="h-8 pl-8"
                                    placeholder="Họ tên người nhận xét..."
                                    value={t.author}
                                    onChange={(e) => updateTestimonial(idx, "author", e.target.value)}
                                  />
                                </div>
                                <div className="relative flex items-center">
                                  <Icon icon="solar:case-minimalistic-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                  <Input
                                    className="h-8 pl-8"
                                    placeholder="Chức vụ / Công ty..."
                                    value={t.role}
                                    onChange={(e) => updateTestimonial(idx, "role", e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="relative flex items-center">
                                <Icon icon="solar:link-round-angle-line-duotone" className="absolute left-2.5 size-3.5 text-muted-foreground" />
                                <Input
                                  className="h-7 pl-8"
                                  placeholder="Đường dẫn ảnh đại diện..."
                                  value={t.avatar || ""}
                                  onChange={(e) => updateTestimonial(idx, "avatar", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="text-[10px] text-muted-foreground/60 flex items-center justify-between border-t border-border/20 pt-1.5 mt-0.5">
                              <span>Nhận xét #{idx + 1}</span>
                              <Button
                                type="button"
                                variant="danger"
                                size="icon-sm"
                                onClick={() => removeTestimonial(idx)}
                                title="Xóa nhận xét"
                              >
                                <Icon icon="solar:trash-bin-trash-line-duotone" className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-4">
                <div className="flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:info-square-line-duotone" className="size-4 shrink-0 text-vanixjnk" />
                  <span className="text-xs font-bold text-foreground">Trạng thái phát hành</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-foreground block">Độ hiển thị</span>
                    <span className="text-[10px] text-muted-foreground block">Đặt trạng thái phát hành sản phẩm.</span>
                  </div>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bản nháp">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:document-text-line-duotone" className="size-3.5 text-muted-foreground shrink-0" />
                          <span>Bản nháp</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Đang phát triển">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:refresh-line-duotone" className="size-3.5 text-amber-500 shrink-0" />
                          <span>Đang phát triển</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Hoàn thành">
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:check-circle-line-duotone" className="size-3.5 text-emerald-500 shrink-0" />
                          <span>Hoàn thành</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                <div className="flex items-center gap-1.5 border-b pb-2 border-border/60">
                  <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-4 shrink-0 text-vanixjnk" />
                  <span className="text-xs font-bold text-foreground">Ảnh bìa (Thumbnail)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="h-9 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 shrink-0 cursor-pointer"
                    onClick={() => {
                      setGalleryTarget({ type: "thumbnail" });
                      setGalleryOpen(true);
                    }}
                    title="Chọn từ thư viện"
                  >
                    <Icon icon="solar:gallery-send-line-duotone" className="text-base" />
                  </Button>
                </div>
                <div className="border border-border/50 rounded-xl bg-muted/20 min-h-[140px] p-2 flex items-center justify-center relative overflow-hidden group">
                  {formData.thumbnail ? (
                    <img src={formData.thumbnail} alt="Bìa dự án" className="max-h-[200px] w-full object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60 text-[10px]">
                      <Icon icon="solar:gallery-minimalistic-line-duotone" className="size-8 opacity-40" />
                      <span>Chưa chọn ảnh bìa</span>
                    </div>
                  )}
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
