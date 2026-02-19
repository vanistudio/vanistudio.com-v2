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

const initialForm = {
  title: "", slug: "", excerpt: "", content: "",
  thumbnail: "", coverImage: "",
  category: "", tags: "",
  status: "draft",
  isFeatured: false,
  authorName: "", authorAvatar: "",
  metaTitle: "", metaDescription: "", metaKeywords: "",
  canonicalUrl: "", ogImage: "",
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

export default function BlogForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  usePageTitle(isEditing ? "Chỉnh sửa bài viết" : "Viết bài mới");
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (id) {
      setLoading(true);
      (api.api.admin.blog as any)({ id }).get().then(({ data }: any) => {
        if (data?.success && data.post) {
          const p = data.post;
          setForm({
            title: p.title || "", slug: p.slug || "", excerpt: p.excerpt || "",
            content: p.content || "",
            thumbnail: p.thumbnail || "", coverImage: p.coverImage || "",
            category: p.category || "", tags: Array.isArray(p.tags) ? p.tags.join(", ") : (p.tags || ""),
            status: p.status || "draft",
            isFeatured: p.isFeatured || false,
            authorName: p.authorName || "", authorAvatar: p.authorAvatar || "",
            metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "",
            metaKeywords: p.metaKeywords || "",
            canonicalUrl: p.canonicalUrl || "", ogImage: p.ogImage || "",
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title || !form.slug) return toast.error("Tiêu đề và slug là bắt buộc");
    setSubmitting(true);
    try {
      const payload: any = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (isEditing && id) {
        const { data } = await (api.api.admin.blog as any)({ id }).patch(payload);
        if (data?.success) { toast.success("Cập nhật thành công"); navigate("/admin/blog"); }
        else toast.error(data?.error || "Thất bại");
      } else {
        const { data } = await (api.api.admin.blog as any).post(payload);
        if (data?.success) { toast.success("Tạo bài viết thành công"); navigate("/admin/blog"); }
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
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground animate-spin" />
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
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/admin/blog")}>
              <Icon icon="solar:arrow-left-bold" className="text-sm" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-title">{isEditing ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h1>
              <p className="text-xs text-muted-foreground">Tạo nội dung blog hỗ trợ SEO</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/blog")}>
              Hủy
            </Button>
            <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
              <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Xuất bản"}
            </Button>
          </div>
        </div>
      </AppDashed>

      <Section title="Nội dung bài viết" icon="solar:pen-new-square-bold-duotone" description="Tiêu đề, slug và nội dung chính">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tiêu đề bài viết *">
            <Input className="text-sm" placeholder="Hướng dẫn tối ưu hiệu suất React" value={form.title}
              onChange={(e) => { set("title", e.target.value); if (!isEditing) set("slug", generateSlug(e.target.value)); }} />
          </Field>
          <Field label="Slug *" hint="URL-friendly, tự động theo tiêu đề">
            <Input className="text-sm font-mono" placeholder="huong-dan-toi-uu-hieu-suat-react" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Tóm tắt" span={2} hint="Hiển thị trong danh sách blog và mô tả meta">
            <Textarea className="text-sm min-h-[60px] resize-y" placeholder="Tóm tắt ngắn gọn về nội dung bài viết..." value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
          </Field>
          <Field label="Nội dung bài viết" span={2} hint="Hỗ trợ Markdown hoặc HTML">
            <Textarea className="text-sm min-h-[300px] resize-y font-mono" placeholder="# Tiêu đề&#10;&#10;Nội dung bài viết của bạn..." value={form.content} onChange={(e) => set("content", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Phân loại & Trạng thái" icon="solar:tag-bold-duotone" description="Chuyên mục, tags và trạng thái xuất bản">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Chuyên mục">
            <Input className="text-sm" placeholder="Lập trình, Design, Tutorial..." value={form.category} onChange={(e) => set("category", e.target.value)} />
          </Field>
          <Field label="Tags" hint="Phân cách bằng dấu phẩy">
            <Input className="text-sm" placeholder="react, performance, optimization" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
          <Field label="Trạng thái">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Xuất bản</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Bài viết nổi bật">
            <div className="flex items-center gap-3 pt-1">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => set("isFeatured", v)} />
              <span className="text-xs text-muted-foreground">{form.isFeatured ? "Đang ghim" : "Không ghim"}</span>
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Media" icon="solar:gallery-bold-duotone" description="Ảnh đại diện và ảnh bìa bài viết">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Thumbnail">
            <FileUploadDialog value={form.thumbnail} onChange={(url) => set("thumbnail", url)} label="Upload" />
          </Field>
          <Field label="Cover Image">
            <FileUploadDialog value={form.coverImage} onChange={(url) => set("coverImage", url)} label="Upload" />
          </Field>
        </div>
      </Section>

      <Section title="Tác giả" icon="solar:user-bold-duotone" description="Thông tin người viết">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên tác giả">
            <Input className="text-sm" placeholder="Nguyễn Văn A" value={form.authorName} onChange={(e) => set("authorName", e.target.value)} />
          </Field>
          <Field label="Avatar tác giả">
            <FileUploadDialog value={form.authorAvatar} onChange={(url) => set("authorAvatar", url)} label="Upload" />
          </Field>
        </div>
      </Section>

      <Section title="SEO & Meta" icon="solar:magnifer-bold-duotone" description="Tối ưu hiển thị trên công cụ tìm kiếm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Meta Title" hint="Để trống sẽ dùng tiêu đề bài viết">
            <Input className="text-sm" placeholder="Hướng dẫn tối ưu React | VaniStudio Blog" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
          </Field>
          <Field label="Meta Keywords" hint="Phân cách bằng dấu phẩy">
            <Input className="text-sm" placeholder="react, performance, web development" value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} />
          </Field>
          <Field label="Meta Description" span={2}>
            <Textarea className="text-sm resize-y" placeholder="Mô tả ngắn gọn cho Google Search Results..." value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
          </Field>
          <Field label="Canonical URL" hint="URL chính thức nếu bài được đăng lại">
            <Input className="text-sm" placeholder="https://vanistudio.com/blog/..." value={form.canonicalUrl} onChange={(e) => set("canonicalUrl", e.target.value)} />
          </Field>
          <Field label="OG Image" hint="Ảnh hiển thị khi chia sẻ mạng xã hội">
            <FileUploadDialog value={form.ogImage} onChange={(url) => set("ogImage", url)} label="Upload" />
          </Field>
        </div>
      </Section>

      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/blog")}>
            Hủy bỏ
          </Button>
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật bài viết" : "Xuất bản bài viết"}
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
