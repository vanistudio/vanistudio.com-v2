import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/70">{hint}</p>}
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
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon icon="solar:document-bold-duotone" className="text-sm text-primary" />
              </div>
              <span className="text-sm font-semibold text-title">Thông tin cơ bản</span>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <Field label="Slug *" hint="URL-friendly, tự động theo tên">
                  <Input className="text-sm font-mono" placeholder="web-application" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
                </Field>
              </div>
              <Field label="Mô tả" hint="Hiển thị bên dưới tên chuyên mục trên trang chủ">
                <Input className="text-sm" placeholder="Mô tả ngắn gọn về chuyên mục..." value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <Icon icon="solar:pallete-2-bold-duotone" className="text-sm text-primary" />
              </div>
              <span className="text-sm font-semibold text-title">Hiển thị</span>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-4">
              <Field label="Icon (Iconify ID)" hint="Tìm icon tại icones.js.org — VD: solar:code-square-bold-duotone">
                <div className="flex items-center gap-3">
                  <Input className="text-sm font-mono flex-1" placeholder="solar:code-square-bold-duotone" value={form.icon} onChange={(e) => set("icon", e.target.value)} />
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                    <Icon icon={form.icon || "solar:question-circle-bold-duotone"} className="text-xl text-muted-foreground" />
                  </div>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Thứ tự sắp xếp" hint="Số nhỏ hơn hiển thị trước">
                  <Input className="text-sm" type="number" placeholder="0" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} />
                </Field>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Trạng thái</Label>
                  <div className="flex items-center gap-3 h-9 px-3 rounded-md border border-border bg-background">
                    <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
                    <span className="text-sm">
                      {form.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <div className="size-1.5 rounded-full bg-zinc-400" />
                          Ẩn
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/admin/categories")}>
            Hủy bỏ
          </Button>
          <Button size="sm" className="text-xs gap-1.5" disabled={submitting} onClick={handleSubmit}>
            <Icon icon="solar:check-circle-bold-duotone" className="text-sm" />
            {submitting ? "Đang lưu..." : isEditing ? "Cập nhật chuyên mục" : "Tạo chuyên mục"}
          </Button>
        </div>
      </AppDashed>
    </div>
  );
}
