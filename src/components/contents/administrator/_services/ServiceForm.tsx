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

const ICON_OPTIONS = [
  { value: "solar:monitor-bold-duotone", label: "Website" },
  { value: "solar:smartphone-bold-duotone", label: "Mobile App" },
  { value: "solar:laptop-bold-duotone", label: "Laptop" },
  { value: "solar:code-square-bold-duotone", label: "Code" },
  { value: "solar:palette-bold-duotone", label: "Design" },
  { value: "solar:pen-bold-duotone", label: "Pen" },
  { value: "solar:cart-large-bold-duotone", label: "E-Commerce" },
  { value: "solar:server-bold-duotone", label: "Server" },
  { value: "solar:database-bold-duotone", label: "Database" },
  { value: "solar:cloud-bold-duotone", label: "Cloud" },
  { value: "solar:shield-check-bold-duotone", label: "Security" },
  { value: "solar:chart-bold-duotone", label: "Analytics" },
  { value: "solar:graph-up-bold-duotone", label: "SEO" },
  { value: "solar:rocket-bold-duotone", label: "Startup" },
  { value: "solar:bolt-bold-duotone", label: "Performance" },
  { value: "solar:settings-bold-duotone", label: "Settings" },
  { value: "solar:chat-round-dots-bold-duotone", label: "Chatbot" },
  { value: "solar:letter-bold-duotone", label: "Email" },
  { value: "solar:camera-bold-duotone", label: "Photo" },
  { value: "solar:video-frame-bold-duotone", label: "Video" },
  { value: "solar:gamepad-bold-duotone", label: "Game" },
  { value: "solar:user-bold-duotone", label: "User" },
  { value: "solar:users-group-rounded-bold-duotone", label: "Team" },
  { value: "solar:wallet-bold-duotone", label: "Payment" },
  { value: "solar:gift-bold-duotone", label: "Gift" },
  { value: "solar:star-bold-duotone", label: "Star" },
  { value: "solar:heart-bold-duotone", label: "Heart" },
  { value: "solar:bookmark-bold-duotone", label: "Bookmark" },
  { value: "solar:map-point-bold-duotone", label: "Map" },
  { value: "solar:gallery-bold-duotone", label: "Gallery" },
  { value: "solar:music-notes-bold-duotone", label: "Music" },
  { value: "solar:tuning-2-bold-duotone", label: "Tuning" },
  { value: "solar:box-bold-duotone", label: "Box" },
  { value: "solar:document-text-bold-duotone", label: "Document" },
  { value: "solar:link-circle-bold-duotone", label: "Link" },
  { value: "solar:magnifer-bold-duotone", label: "Search" },
  { value: "solar:lock-bold-duotone", label: "Lock" },
  { value: "solar:folder-bold-duotone", label: "Folder" },
  { value: "solar:clipboard-bold-duotone", label: "Clipboard" },
  { value: "solar:widget-5-bold-duotone", label: "Widget" },
];

const initialForm = {
  name: "", slug: "", tagline: "", description: "", content: "",
  icon: "", thumbnail: "", coverImage: "",
  price: "0", minPrice: "", maxPrice: "",
  currency: "VND", priceUnit: "",
  status: "draft",
  categoryId: "",
  features: "",
  deliverables: "",
  estimatedDays: "",
  isFeatured: false,
  sortOrder: "0",
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

export default function ServiceForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  usePageTitle(isEditing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ");
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (id) {
      setLoading(true);
      (api.api.admin.services as any)({ id }).get().then(({ data }: any) => {
        if (data?.success && data.service) {
          const s = data.service;
          setForm({
            name: s.name || "", slug: s.slug || "", tagline: s.tagline || "",
            description: s.description || "", content: s.content || "",
            icon: s.icon || "", thumbnail: s.thumbnail || "", coverImage: s.coverImage || "",
            price: String(s.price || 0), minPrice: s.minPrice ? String(s.minPrice) : "",
            maxPrice: s.maxPrice ? String(s.maxPrice) : "",
            currency: s.currency || "VND", priceUnit: s.priceUnit || "",
            status: s.status || "draft",
            categoryId: s.categoryId || "",
            features: (s.features || []).join("\n"),
            deliverables: (s.deliverables || []).join("\n"),
            estimatedDays: s.estimatedDays?.toString() || "",
            isFeatured: s.isFeatured || false,
            sortOrder: s.sortOrder?.toString() || "0",
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
        features: form.features ? form.features.split("\n").filter(Boolean) : [],
        deliverables: form.deliverables ? form.deliverables.split("\n").filter(Boolean) : [],
        estimatedDays: form.estimatedDays ? parseInt(form.estimatedDays) : null,
        sortOrder: parseInt(form.sortOrder) || 0,
        categoryId: form.categoryId || undefined,
        minPrice: form.minPrice || undefined,
        maxPrice: form.maxPrice || undefined,
      };
      if (isEditing && id) {
        const { data } = await (api.api.admin.services as any)({ id }).patch(payload);
        if (data?.success) { toast.success("Cập nhật thành công"); navigate("/admin/services"); }
        else toast.error(data?.error || "Thất bại");
      } else {
        const { data } = await (api.api.admin.services as any).post(payload);
        if (data?.success) { toast.success("Tạo dịch vụ thành công"); navigate("/admin/services"); }
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
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
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
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/admin/services")}>
              <Icon icon="solar:arrow-left-bold" className="text-sm" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-title">{isEditing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h1>
              <p className="text-xs text-muted-foreground">Điền thông tin dịch vụ</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/services")}>
              Hủy
            </Button>
            <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
              <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
              {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo dịch vụ"}
            </Button>
          </div>
        </div>
      </AppDashed>
      <Section title="Thông tin cơ bản" icon="solar:document-bold-duotone" description="Tên, mô tả dịch vụ hiển thị trên trang chủ">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tên dịch vụ *">
            <Input className="text-sm" placeholder="Thiết kế website" value={form.name}
              onChange={(e) => { set("name", e.target.value); if (!isEditing) set("slug", generateSlug(e.target.value)); }} />
          </Field>
          <Field label="Slug *" hint="URL-friendly, tự động theo tên">
            <Input className="text-sm font-mono" placeholder="thiet-ke-website" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Icon" hint="Chọn icon hiển thị cho dịch vụ">
            <div className="flex items-center gap-3">
              <Select value={form.icon} onValueChange={(v) => set("icon", v)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Chọn icon...">
                    {form.icon && (
                      <span className="flex items-center gap-2">
                        <Icon icon={form.icon} className="text-base" />
                        {ICON_OPTIONS.find((o) => o.value === form.icon)?.label || form.icon}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <Icon icon={opt.value} className="text-base text-muted-foreground" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                <Icon icon={form.icon || "solar:question-circle-bold-duotone"} className="text-xl text-muted-foreground" />
              </div>
            </div>
          </Field>
          <Field label="Thứ tự hiển thị" hint="Số nhỏ hiển thị trước">
            <Input className="text-sm" type="number" placeholder="0" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
          </Field>
          <Field label="Tagline" span={2}>
            <Input className="text-sm" placeholder="Mô tả ngắn gọn 1 dòng cho dịch vụ..." value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Mô tả chi tiết" span={2}>
            <Textarea className="text-sm min-h-[80px] resize-y" placeholder="Mô tả chi tiết về dịch vụ, quy trình làm việc..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>
      </Section>
      <Section title="Giá cả" icon="solar:wallet-bold-duotone" description="Thiết lập mức giá dịch vụ">
        <div className="grid grid-cols-3 gap-4">
          <Field label="Giá hiển thị" hint="Nhập 0 nếu liên hệ">
            <Input className="text-sm" type="number" placeholder="5000000" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Giá tối thiểu" hint="Để trống nếu không cần">
            <Input className="text-sm" type="number" placeholder="3000000" value={form.minPrice} onChange={(e) => set("minPrice", e.target.value)} />
          </Field>
          <Field label="Giá tối đa" hint="Để trống nếu không cần">
            <Input className="text-sm" type="number" placeholder="10000000" value={form.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} />
          </Field>
          <Field label="Đơn vị giá" hint="Ví dụ: / dự án, / tháng">
            <Input className="text-sm" placeholder="/ dự án" value={form.priceUnit} onChange={(e) => set("priceUnit", e.target.value)} />
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
          <Field label="Thời gian ước tính (ngày)" hint="Số ngày hoàn thành dự kiến">
            <Input className="text-sm" type="number" placeholder="14" value={form.estimatedDays} onChange={(e) => set("estimatedDays", e.target.value)} />
          </Field>
        </div>
      </Section>
      <Section title="Phân loại" icon="solar:tag-bold-duotone" description="Trạng thái xuất bản">
        <div className="grid grid-cols-2 gap-4">
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
      <Section title="Media" icon="solar:gallery-bold-duotone" description="Hình ảnh đại diện cho dịch vụ">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Thumbnail">
            <FileUploadDialog value={form.thumbnail} onChange={(url) => set("thumbnail", url)} label="Upload" />
          </Field>
          <Field label="Cover Image">
            <FileUploadDialog value={form.coverImage} onChange={(url) => set("coverImage", url)} label="Upload" />
          </Field>
        </div>
      </Section>
      <Section title="Tính năng" icon="solar:star-bold-duotone" description="Liệt kê tính năng chính, mỗi dòng một tính năng">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Danh sách tính năng" hint="Mỗi dòng 1 tính năng">
            <Textarea className="text-sm min-h-[120px] resize-y" placeholder={"Responsive design\nSEO tối ưu\nTốc độ nhanh\nHỗ trợ đa ngôn ngữ"} value={form.features} onChange={(e) => set("features", e.target.value)} />
          </Field>
          <Field label="Sản phẩm bàn giao" hint="Mỗi dòng 1 sản phẩm bàn giao">
            <Textarea className="text-sm min-h-[120px] resize-y" placeholder={"Source code\nHướng dẫn sử dụng\nHỗ trợ 30 ngày\nDomain + hosting setup"} value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)} />
          </Field>
        </div>
      </Section>
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/services")}>
            Hủy bỏ
          </Button>
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật dịch vụ" : "Tạo dịch vụ"}
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
