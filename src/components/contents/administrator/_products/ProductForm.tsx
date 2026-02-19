import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import FileUploadDialog from "@/components/vani/FileUploadDialog";
import MultiFileUpload from "@/components/vani/MultiFileUpload";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const initialForm = {
  name: "", slug: "", tagline: "", description: "", content: "",
  categoryId: "", type: "premium", status: "draft",
  thumbnail: "", coverImage: "", images: [] as string[], videoUrl: "",
  demoUrl: "", sourceUrl: "", documentationUrl: "",
  techStack: "", tags: "", frameworks: "",
  price: "0", salePrice: "", currency: "VND",
  version: "1.0.0", compatibility: "", requirements: "", fileSize: "",
  features: "",
  warrantyMonths: "3", supportEmail: "",
  metaTitle: "", metaDescription: "", metaKeywords: "",
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

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  usePageTitle(isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm");
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    api.api.admin.categories.get().then(({ data }) => {
      if (data?.success) setCategories((data as any).categories || []);
    });
    if (id) {
      setLoading(true);
      api.api.admin.products({ id }).get().then(({ data }: any) => {
        if (data?.success && data.product) {
          const p = data.product;
          setForm({
            name: p.name || "", slug: p.slug || "", tagline: p.tagline || "",
            description: p.description || "", content: p.content || "",
            categoryId: p.categoryId || "", type: p.type || "premium", status: p.status || "draft",
            thumbnail: p.thumbnail || "", coverImage: p.coverImage || "",
            images: Array.isArray(p.images) ? p.images : [],
            videoUrl: p.videoUrl || "",
            demoUrl: p.demoUrl || "", sourceUrl: p.sourceUrl || "", documentationUrl: p.documentationUrl || "",
            techStack: (p.techStack || []).join(", "), tags: (p.tags || []).join(", "),
            frameworks: (p.frameworks || []).join(", "),
            price: String(p.price || 0), salePrice: p.salePrice ? String(p.salePrice) : "",
            currency: p.currency || "VND",
            version: p.version || "1.0.0", compatibility: p.compatibility || "",
            requirements: p.requirements || "", fileSize: p.fileSize || "",
            features: (p.features || []).join("\n"),
            warrantyMonths: String(p.warrantyMonths || 3), supportEmail: p.supportEmail || "",
            metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "", metaKeywords: p.metaKeywords || "",
          });
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.slug) return toast.error("Tên và slug là bắt buộc");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId || undefined,
        salePrice: form.salePrice || undefined,
        techStack: form.techStack ? form.techStack.split(",").map((s) => s.trim()) : [],
        tags: form.tags ? form.tags.split(",").map((s) => s.trim()) : [],
        frameworks: form.frameworks ? form.frameworks.split(",").map((s) => s.trim()) : [],
        features: form.features ? form.features.split("\n").filter(Boolean) : [],
        warrantyMonths: parseInt(form.warrantyMonths) || 3,
      };
      if (isEditing && id) {
        const { data } = await api.api.admin.products({ id }).patch(payload as any);
        if (data?.success) { toast.success("Cập nhật thành công"); navigate("/admin/products"); }
        else toast.error((data as any)?.error || "Thất bại");
      } else {
        const { data } = await api.api.admin.products.post(payload as any);
        if (data?.success) { toast.success("Tạo sản phẩm thành công"); navigate("/admin/products"); }
        else toast.error((data as any)?.error || "Thất bại");
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
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/admin/products")}>
              <Icon icon="solar:arrow-left-bold" className="text-sm" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-title">{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
              <p className="text-xs text-muted-foreground">Điền thông tin sản phẩm mã nguồn</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/products")}>
              Hủy
            </Button>
            <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
              <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo sản phẩm"}
            </Button>
          </div>
        </div>
      </AppDashed>
      <Section title="Thông tin cơ bản" icon="solar:document-bold-duotone" description="Tên, mô tả sản phẩm hiển thị trên trang chủ">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên sản phẩm *">
            <Input className="text-sm" placeholder="VaniStudio Pro" value={form.name}
              onChange={(e) => { set("name", e.target.value); if (!isEditing) set("slug", generateSlug(e.target.value)); }} />
          </Field>
          <Field label="Slug *" hint="URL-friendly, tự động theo tên">
            <Input className="text-sm font-mono" placeholder="vanistudio-pro" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Tagline" span={2}>
            <Input className="text-sm" placeholder="Mô tả ngắn gọn 1 dòng cho sản phẩm..." value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Mô tả chi tiết" span={2}>
            <Textarea className="text-sm min-h-[80px] resize-y" placeholder="Mô tả chi tiết về sản phẩm, tính năng nổi bật..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
      </Section>
      <Section title="Phân loại" icon="solar:tag-bold-duotone" description="Chuyên mục, loại sản phẩm và trạng thái xuất bản">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Chuyên mục">
            <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger className="w-full text-sm"><SelectValue placeholder="Chọn chuyên mục..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Loại sản phẩm">
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Miễn phí</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </Section>
      <Section title="Giá cả" icon="solar:wallet-bold-duotone" description="Thiết lập giá bán và khuyến mãi">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Giá gốc" hint="Nhập 0 cho sản phẩm miễn phí">
            <Input className="text-sm" type="number" placeholder="0" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Giá khuyến mãi" hint="Để trống nếu không giảm giá">
            <Input className="text-sm" type="number" placeholder="—" value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} />
          </Field>
          <Field label="Đơn vị tiền tệ">
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND - Việt Nam Đồng</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>
      <Section title="Media" icon="solar:gallery-bold-duotone" description="Hình ảnh và video giới thiệu sản phẩm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Thumbnail">
            <FileUploadDialog value={form.thumbnail} onChange={(url) => set("thumbnail", url)} label="Upload" />
          </Field>
          <Field label="Cover Image">
            <FileUploadDialog value={form.coverImage} onChange={(url) => set("coverImage", url)} label="Upload" />
          </Field>
          <Field label="Video giới thiệu" span={2} hint="YouTube, Vimeo hoặc link video trực tiếp">
            <Input className="text-sm" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
          </Field>
          <Field label="Ảnh demo sản phẩm" span={2} hint="Upload nhiều ảnh screenshot, demo giao diện">
            <MultiFileUpload value={form.images} onChange={(urls) => setForm((f) => ({ ...f, images: urls }))} />
          </Field>
        </div>
      </Section>
      <Section title="Demo & Source" icon="solar:link-circle-bold-duotone" description="Liên kết demo, mã nguồn và tài liệu">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Demo URL">
            <Input className="text-sm" placeholder="https://demo.example.com" value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} />
          </Field>
          <Field label="Source URL">
            <Input className="text-sm" placeholder="https://github.com/..." value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
          </Field>
          <Field label="Documentation URL" span={2}>
            <Input className="text-sm" placeholder="https://docs.example.com" value={form.documentationUrl} onChange={(e) => set("documentationUrl", e.target.value)} />
          </Field>
        </div>
      </Section>
      <Section title="Tech Stack & Tags" icon="solar:code-square-bold-duotone" description="Công nghệ sử dụng và từ khóa tìm kiếm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tech Stack" hint="Phân cách bằng dấu phẩy">
            <Input className="text-sm" placeholder="React, TypeScript, Tailwind CSS" value={form.techStack} onChange={(e) => set("techStack", e.target.value)} />
          </Field>
          <Field label="Frameworks" hint="Phân cách bằng dấu phẩy">
            <Input className="text-sm" placeholder="Vite, ElysiaJS" value={form.frameworks} onChange={(e) => set("frameworks", e.target.value)} />
          </Field>
          <Field label="Tags" span={2} hint="Phân cách bằng dấu phẩy, dùng cho tìm kiếm">
            <Input className="text-sm" placeholder="dashboard, admin, saas, starter-kit" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
        </div>
      </Section>
      <Section title="Thông số kỹ thuật" icon="solar:settings-bold-duotone" description="Phiên bản, tương thích và yêu cầu hệ thống">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Phiên bản">
            <Input className="text-sm font-mono" placeholder="1.0.0" value={form.version} onChange={(e) => set("version", e.target.value)} />
          </Field>
          <Field label="Kích thước file">
            <Input className="text-sm" placeholder="25 MB" value={form.fileSize} onChange={(e) => set("fileSize", e.target.value)} />
          </Field>
          <Field label="Tương thích">
            <Input className="text-sm" placeholder="Node 18+, Bun 1.x" value={form.compatibility} onChange={(e) => set("compatibility", e.target.value)} />
          </Field>
          <Field label="Yêu cầu hệ thống">
            <Input className="text-sm" placeholder="PostgreSQL 15+, Redis" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
          </Field>
        </div>
      </Section>
      <Section title="Tính năng" icon="solar:star-bold-duotone" description="Liệt kê tính năng chính, mỗi dòng một tính năng">
        <Field label="Danh sách tính năng" span={2}>
          <Textarea className="text-sm min-h-[120px] resize-y" placeholder={"Đăng nhập OAuth (Google, GitHub)\nDashboard thống kê realtime\nQuản lý người dùng & phân quyền\nThanh toán tích hợp\n..."} value={form.features} onChange={(e) => set("features", e.target.value)} />
        </Field>
      </Section>
      <Section title="Bảo hành & Hỗ trợ" icon="solar:shield-check-bold-duotone" description="Chính sách bảo hành và thông tin liên hệ hỗ trợ">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bảo hành (tháng)" hint="Mặc định 3 tháng">
            <Input className="text-sm" type="number" placeholder="3" value={form.warrantyMonths} onChange={(e) => set("warrantyMonths", e.target.value)} />
          </Field>
          <Field label="Email hỗ trợ">
            <Input className="text-sm" placeholder="support@vanistudio.com" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
          </Field>
        </div>
      </Section>
      <Section title="SEO" icon="solar:magnifer-bold-duotone" description="Tối ưu hiển thị trên công cụ tìm kiếm">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Meta Title" hint="Để trống sẽ dùng tên sản phẩm">
            <Input className="text-sm" placeholder="VaniStudio Pro — Premium Source Code" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
          </Field>
          <Field label="Meta Keywords" hint="Phân cách bằng dấu phẩy">
            <Input className="text-sm" placeholder="source code, react, admin" value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} />
          </Field>
          <Field label="Meta Description" span={2}>
            <Textarea className="text-sm resize-y" placeholder="Mô tả ngắn gọn cho Google Search Results..." value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
          </Field>
        </div>
      </Section>
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/products")}>
            Hủy bỏ
          </Button>
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
