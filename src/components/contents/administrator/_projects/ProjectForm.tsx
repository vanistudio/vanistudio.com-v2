import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import FileUploadDialog from "@/components/vani/FileUploadDialog";
import MultiFileUpload from "@/components/vani/MultiFileUpload";

const initialForm = {
  name: "", slug: "", tagline: "", description: "", content: "",
  thumbnail: "", coverImage: "", images: [] as string[], videoUrl: "",
  liveUrl: "", sourceUrl: "", figmaUrl: "",
  category: "", techStack: "", tags: "",
  status: "draft", type: "personal",
  startDate: "", endDate: "", isOngoing: false,
  clientName: "", role: "",
  isFeatured: false,
  metaTitle: "", metaDescription: "",
};

function generateSlug(name: string) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Section({ title, icon, description, children }: { title: string; icon: string; description?: string; children: React.ReactNode }) {
  return (
    <AppDashed noTopBorder padding="p-5">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon={icon} className="text-sm text-primary" />
            </div>
            <span className="text-sm font-semibold text-title">{title}</span>
          </div>
          {description && <p className="text-xs text-muted-foreground mt-1 ml-9">{description}</p>}
        </div>
        <Separator />
        {children}
      </div>
    </AppDashed>
  );
}

function Field({ label, hint, children, span = 1 }: { label: string; hint?: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={`space-y-1.5 ${span === 2 ? "col-span-2" : span === 3 ? "col-span-3" : ""}`}>
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export default function ProjectForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  usePageTitle(isEditing ? "Chỉnh sửa dự án" : "Thêm dự án mới");
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (id) {
      setLoading(true);
      (api.api.admin.projects as any)({ id }).get().then(({ data }: any) => {
        if (data?.success && data.project) {
          const p = data.project;
          setForm({
            name: p.name || "", slug: p.slug || "", tagline: p.tagline || "",
            description: p.description || "", content: p.content || "",
            thumbnail: p.thumbnail || "", coverImage: p.coverImage || "",
            images: Array.isArray(p.images) ? p.images : [],
            videoUrl: p.videoUrl || "",
            liveUrl: p.liveUrl || "", sourceUrl: p.sourceUrl || "", figmaUrl: p.figmaUrl || "",
            category: p.category || "",
            techStack: Array.isArray(p.techStack) ? p.techStack.join(", ") : (p.techStack || ""),
            tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || ""),
            status: p.status || "draft", type: p.type || "personal",
            startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
            endDate: p.endDate ? new Date(p.endDate).toISOString().split("T")[0] : "",
            isOngoing: p.isOngoing || false,
            clientName: p.clientName || "", role: p.role || "",
            isFeatured: p.isFeatured || false,
            metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "",
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.slug) return toast.error("Tên và slug là bắt buộc");
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        techStack: form.techStack ? form.techStack.split(",").map((s) => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (isEditing && id) {
        const { data } = await (api.api.admin.projects as any)({ id }).patch(payload);
        if (data?.success) { toast.success("Cập nhật thành công"); navigate("/admin/projects"); }
        else toast.error(data?.error || "Thất bại");
      } else {
        const { data } = await (api.api.admin.projects as any).post(payload);
        if (data?.success) { toast.success("Tạo dự án thành công"); navigate("/admin/projects"); }
        else toast.error(data?.error || "Thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/admin/projects")}>
              <Icon icon="solar:arrow-left-bold" className="text-sm" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-title">{isEditing ? "Chỉnh sửa dự án" : "Thêm dự án mới"}</h1>
              <p className="text-xs text-muted-foreground">Quản lý dự án cá nhân & portfolio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/projects")}>Hủy</Button>
            <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
              <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo dự án"}
            </Button>
          </div>
        </div>
      </AppDashed>

      <Section title="Thông tin dự án" icon="solar:code-square-bold-duotone" description="Tên, mô tả và nội dung chi tiết">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên dự án *">
            <Input className="text-sm" placeholder="Portfolio Website" value={form.name}
              onChange={(e) => { set("name", e.target.value); if (!isEditing) set("slug", generateSlug(e.target.value)); }} />
          </Field>
          <Field label="Slug *" hint="URL-friendly, tự động theo tên">
            <Input className="text-sm font-mono" placeholder="portfolio-website" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Tagline" span={2} hint="Mô tả ngắn gọn một dòng">
            <Input className="text-sm" placeholder="Website portfolio cá nhân bằng Next.js" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Mô tả tóm tắt" span={2}>
            <Textarea className="text-sm min-h-[60px] resize-y" placeholder="Giới thiệu ngắn gọn về dự án..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Nội dung chi tiết" span={2} hint="Hỗ trợ Markdown hoặc HTML">
            <Textarea className="text-sm min-h-[200px] resize-y font-mono" placeholder="# Giới thiệu&#10;&#10;Chi tiết về dự án..." value={form.content} onChange={(e) => set("content", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Phân loại & Trạng thái" icon="solar:tag-bold-duotone" description="Loại dự án, tech stack và trạng thái">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Loại dự án">
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Cá nhân</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="open-source">Open Source</SelectItem>
                <SelectItem value="collaboration">Hợp tác</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Trạng thái">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Công khai</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Chuyên mục">
            <Input className="text-sm" placeholder="Web App, Mobile App, Design..." value={form.category} onChange={(e) => set("category", e.target.value)} />
          </Field>
          <Field label="Tech Stack" hint="Phân cách bằng dấu phẩy">
            <Input className="text-sm" placeholder="React, TypeScript, TailwindCSS" value={form.techStack} onChange={(e) => set("techStack", e.target.value)} />
          </Field>
          <Field label="Tags" hint="Phân cách bằng dấu phẩy">
            <Input className="text-sm" placeholder="fullstack, responsive, portfolio" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
          <Field label="Dự án nổi bật">
            <div className="flex items-center gap-3 pt-1">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set("isFeatured", v)} />
              <span className="text-xs text-muted-foreground">{form.isFeatured ? "Đang ghim" : "Không ghim"}</span>
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Links" icon="solar:link-bold-duotone" description="URL demo, source code và thiết kế">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Live URL" hint="Link website đang hoạt động">
            <Input className="text-sm" placeholder="https://example.com" value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} />
          </Field>
          <Field label="Source Code" hint="GitHub, GitLab, Bitbucket...">
            <Input className="text-sm" placeholder="https://github.com/user/repo" value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
          </Field>
          <Field label="Figma URL" hint="Link thiết kế Figma">
            <Input className="text-sm" placeholder="https://figma.com/file/..." value={form.figmaUrl} onChange={(e) => set("figmaUrl", e.target.value)} />
          </Field>
          <Field label="Video URL" hint="YouTube, Vimeo...">
            <Input className="text-sm" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Media" icon="solar:gallery-bold-duotone" description="Ảnh đại diện, ảnh bìa và ảnh demo">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Thumbnail">
            <FileUploadDialog value={form.thumbnail} onChange={(url) => set("thumbnail", url)} label="Upload" />
          </Field>
          <Field label="Cover Image">
            <FileUploadDialog value={form.coverImage} onChange={(url) => set("coverImage", url)} label="Upload" />
          </Field>
          <Field label="Ảnh demo" span={2}>
            <MultiFileUpload value={form.images} onChange={(urls) => set("images", urls)} />
          </Field>
        </div>
      </Section>

      <Section title="Timeline & Khách hàng" icon="solar:calendar-bold-duotone" description="Thời gian thực hiện và thông tin khách hàng">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ngày bắt đầu">
            <Input type="date" className="text-sm" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field label="Ngày kết thúc">
            <Input type="date" className="text-sm" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} disabled={form.isOngoing} />
          </Field>
          <Field label="Đang thực hiện">
            <div className="flex items-center gap-3 pt-1">
              <Switch checked={form.isOngoing} onCheckedChange={(v) => set("isOngoing", v)} />
              <span className="text-xs text-muted-foreground">{form.isOngoing ? "Đang thực hiện" : "Đã hoàn thành"}</span>
            </div>
          </Field>
          <Field label="Vai trò">
            <Input className="text-sm" placeholder="Full-stack Developer, UI Designer..." value={form.role} onChange={(e) => set("role", e.target.value)} />
          </Field>
          <Field label="Tên khách hàng" hint="Bỏ trống nếu là dự án cá nhân">
            <Input className="text-sm" placeholder="Công ty ABC" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="SEO" icon="solar:magnifer-bold-duotone" description="Tối ưu hiển thị trên công cụ tìm kiếm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Meta Title" hint="Để trống sẽ dùng tên dự án">
            <Input className="text-sm" placeholder="Portfolio Website | VaniStudio" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
          </Field>
          <Field label="Meta Description" span={2}>
            <Textarea className="text-sm resize-y" placeholder="Mô tả ngắn gọn cho Google..." value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
          </Field>
        </div>
      </Section>

      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/projects")}>Hủy bỏ</Button>
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật dự án" : "Tạo dự án"}
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
