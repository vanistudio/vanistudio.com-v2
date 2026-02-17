import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

function generateSlug(name: string) {
  return name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

export default function CategoryForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  usePageTitle(isEditing ? "Chỉnh sửa chuyên mục" : "Thêm chuyên mục");
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "", isActive: true, sortOrder: "0" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.api.admin.categories.get().then(({ data }) => {
      if (data?.success) {
        const cat = ((data as any).categories || []).find((c: any) => c.id === id);
        if (cat) {
          setForm({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || "",
            icon: cat.icon || "",
            isActive: cat.isActive,
            sortOrder: String(cat.sortOrder),
          });
        }
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.slug) return toast.error("Tên và slug là bắt buộc");
    setSubmitting(true);
    try {
      const payload = { ...form, sortOrder: parseInt(form.sortOrder) || 0 } as any;
      if (isEditing && id) {
        const { data } = await api.api.admin.categories({ id }).patch(payload);
        if (data?.success) { toast.success("Cập nhật thành công"); navigate("/admin/categories"); }
        else toast.error((data as any)?.error || "Thất bại");
      } else {
        const { data } = await api.api.admin.categories.post(payload);
        if (data?.success) { toast.success("Tạo chuyên mục thành công"); navigate("/admin/categories"); }
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
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigate("/admin/categories")}>
              <Icon icon="solar:arrow-left-bold" className="text-sm" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-title">{isEditing ? "Chỉnh sửa chuyên mục" : "Thêm chuyên mục mới"}</h1>
              <p className="text-xs text-muted-foreground">Điền thông tin chuyên mục sản phẩm</p>
            </div>
          </div>
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>
        </div>
      </AppDashed>

      {/* Form */}
      <AppDashed noTopBorder padding="p-4">
        <div className="space-y-4 max-w-lg">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tên chuyên mục *">
              <Input
                className="text-sm" placeholder="Web Application"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: isEditing ? f.slug : generateSlug(name) }));
                }}
              />
            </Field>
            <Field label="Slug *">
              <Input className="text-sm" placeholder="web-application" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
            </Field>
          </div>

          <Field label="Mô tả">
            <Input className="text-sm" placeholder="Mô tả ngắn gọn..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>

          <Field label="Icon (Iconify ID)">
            <div className="flex items-center gap-2">
              <Input className="text-sm flex-1" placeholder="solar:code-square-bold-duotone" value={form.icon} onChange={(e) => set("icon", e.target.value)} />
              {form.icon && (
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon icon={form.icon} className="text-lg text-muted-foreground" />
                </div>
              )}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Thứ tự sắp xếp">
              <Input className="text-sm" type="number" placeholder="0" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
            </Field>
            <div className="space-y-1.5">
              <Label className="text-xs">Trạng thái</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
                <span className="text-xs text-muted-foreground">{form.isActive ? "Hoạt động" : "Ẩn"}</span>
              </div>
            </div>
          </div>
        </div>
      </AppDashed>
    </div>
  );
}
