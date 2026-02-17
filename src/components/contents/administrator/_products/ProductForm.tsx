import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const initialForm = {
  name: "", slug: "", tagline: "", description: "", content: "",
  categoryId: "", type: "premium", status: "draft",
  thumbnail: "", coverImage: "", videoUrl: "",
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

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <AppDashed noTopBorder padding="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon icon={icon} className="text-base text-primary" />
          <span className="text-sm font-semibold text-title">{title}</span>
        </div>
        {children}
      </div>
    </AppDashed>
  );
}

function Field({ label, children, span = 1 }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={`space-y-1 ${span === 2 ? "col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
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
            thumbnail: p.thumbnail || "", coverImage: p.coverImage || "", videoUrl: p.videoUrl || "",
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

  const inp = "h-8 text-sm";

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
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/admin/products")}>
              <Icon icon="solar:arrow-left-bold" className="text-sm" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-title">{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h1>
              <p className="text-xs text-muted-foreground">Điền thông tin sản phẩm mã nguồn</p>
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo sản phẩm"}
          </Button>
        </div>
      </AppDashed>

      <Section title="Thông tin cơ bản" icon="solar:document-bold-duotone">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tên sản phẩm *">
            <Input className={inp} placeholder="VaniStudio Pro" value={form.name}
              onChange={(e) => { set("name", e.target.value); set("slug", generateSlug(e.target.value)); }} />
          </Field>
          <Field label="Slug *">
            <Input className={inp} placeholder="vanistudio-pro" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Tagline" span={2}>
            <Input className={inp} placeholder="Mô tả ngắn 1 dòng..." value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Mô tả" span={2}>
            <Textarea className="text-sm min-h-[80px]" placeholder="Mô tả chi tiết sản phẩm..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Phân loại" icon="solar:tag-bold-duotone">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Chuyên mục">
            <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger className={inp}><SelectValue placeholder="Chọn..." /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Loại">
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger className={inp}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Miễn phí</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Trạng thái">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className={inp}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="published">Xuất bản</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Media" icon="solar:gallery-bold-duotone">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Thumbnail URL">
            <Input className={inp} placeholder="https://..." value={form.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} />
          </Field>
          <Field label="Cover Image URL">
            <Input className={inp} placeholder="https://..." value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} />
          </Field>
          <Field label="Video URL" span={2}>
            <Input className={inp} placeholder="https://youtube.com/..." value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Demo & Source" icon="solar:link-circle-bold-duotone">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Demo URL">
            <Input className={inp} placeholder="https://demo.example.com" value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} />
          </Field>
          <Field label="Source URL">
            <Input className={inp} placeholder="https://github.com/..." value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} />
          </Field>
          <Field label="Documentation URL">
            <Input className={inp} placeholder="https://docs.example.com" value={form.documentationUrl} onChange={(e) => set("documentationUrl", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Tech Stack & Tags" icon="solar:code-square-bold-duotone">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tech Stack (phân cách bằng dấu phẩy)">
            <Input className={inp} placeholder="React, TypeScript, Tailwind CSS" value={form.techStack} onChange={(e) => set("techStack", e.target.value)} />
          </Field>
          <Field label="Frameworks (phân cách bằng dấu phẩy)">
            <Input className={inp} placeholder="Vite, ElysiaJS" value={form.frameworks} onChange={(e) => set("frameworks", e.target.value)} />
          </Field>
          <Field label="Tags (phân cách bằng dấu phẩy)" span={2}>
            <Input className={inp} placeholder="dashboard, admin, saas" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Giá cả" icon="solar:wallet-bold-duotone">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Giá (VND)">
            <Input className={inp} type="number" placeholder="0" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Giá khuyến mãi">
            <Input className={inp} type="number" placeholder="Để trống nếu ko giảm giá" value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} />
          </Field>
          <Field label="Tiền tệ">
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger className={inp}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Thông số kỹ thuật" icon="solar:settings-bold-duotone">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phiên bản">
            <Input className={inp} placeholder="1.0.0" value={form.version} onChange={(e) => set("version", e.target.value)} />
          </Field>
          <Field label="Kích thước file">
            <Input className={inp} placeholder="25 MB" value={form.fileSize} onChange={(e) => set("fileSize", e.target.value)} />
          </Field>
          <Field label="Tương thích">
            <Input className={inp} placeholder="Node 18+, Bun 1.x" value={form.compatibility} onChange={(e) => set("compatibility", e.target.value)} />
          </Field>
          <Field label="Yêu cầu">
            <Input className={inp} placeholder="PostgreSQL 15+" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Tính năng (mỗi dòng 1 tính năng)" icon="solar:star-bold-duotone">
        <Field label="Danh sách tính năng" span={2}>
          <Textarea className="text-sm min-h-[100px]" placeholder="Đăng nhập OAuth&#10;Dashboard thống kê&#10;Quản lý người dùng&#10;..." value={form.features} onChange={(e) => set("features", e.target.value)} />
        </Field>
      </Section>

      <Section title="Bảo hành & Hỗ trợ" icon="solar:shield-check-bold-duotone">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bảo hành (tháng)">
            <Input className={inp} type="number" placeholder="3" value={form.warrantyMonths} onChange={(e) => set("warrantyMonths", e.target.value)} />
          </Field>
          <Field label="Email hỗ trợ">
            <Input className={inp} placeholder="support@vanistudio.com" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="SEO" icon="solar:magnifer-bold-duotone">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Meta Title">
            <Input className={inp} placeholder="Tự động theo tên" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
          </Field>
          <Field label="Meta Keywords">
            <Input className={inp} placeholder="source code, react, admin" value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} />
          </Field>
          <Field label="Meta Description" span={2}>
            <Textarea className="text-sm" placeholder="Mô tả cho công cụ tìm kiếm..." value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
          </Field>
        </div>
      </Section>
    </div>
  );
}
