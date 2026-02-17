import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCategories() {
  usePageTitle("Quản lý Chuyên mục");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "" });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.api.admin.categories.get();
      if (data?.success) {
        setCategories((data as any).categories || []);
      }
    } catch {
      toast.error("Không thể tải danh sách chuyên mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", icon: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) return toast.error("Tên và slug là bắt buộc");
    try {
      if (editingId) {
        const { data } = await api.api.admin.categories({ id: editingId }).patch(form as any);
        if (data?.success) { toast.success("Cập nhật thành công"); resetForm(); fetchCategories(); }
        else toast.error((data as any)?.error || "Thất bại");
      } else {
        const { data } = await api.api.admin.categories.post(form as any);
        if (data?.success) { toast.success("Tạo chuyên mục thành công"); resetForm(); fetchCategories(); }
        else toast.error((data as any)?.error || "Thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon || "" });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa chuyên mục này?")) return;
    try {
      const { data } = await api.api.admin.categories({ id }).delete();
      if (data?.success) { toast.success("Đã xóa"); fetchCategories(); }
      else toast.error((data as any)?.error || "Thất bại");
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:folder-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Chuyên mục</h1>
              <p className="text-xs text-muted-foreground">{categories.length} chuyên mục</p>
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => { resetForm(); setShowForm(true); }}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm mới
          </Button>
        </div>
      </AppDashed>

      {showForm && (
        <AppDashed noTopBorder padding="p-4">
          <div className="space-y-3 max-w-lg">
            <p className="text-sm font-semibold text-title">{editingId ? "Chỉnh sửa chuyên mục" : "Thêm chuyên mục mới"}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tên chuyên mục *</Label>
                <Input
                  className="h-8 text-sm" placeholder="Web Application"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({ ...f, name, slug: editingId ? f.slug : generateSlug(name) }));
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Slug *</Label>
                <Input className="h-8 text-sm" placeholder="web-application" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mô tả</Label>
              <Input className="h-8 text-sm" placeholder="Mô tả ngắn gọn..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Icon (Iconify ID)</Label>
              <Input className="h-8 text-sm" placeholder="solar:code-square-bold-duotone" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-xs" onClick={handleSubmit}>
                {editingId ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={resetForm}>Hủy</Button>
            </div>
          </div>
        </AppDashed>
      )}

      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:folder-bold-duotone" className="text-4xl text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có chuyên mục nào</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon icon={cat.icon || "solar:folder-bold-duotone"} className="text-lg text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{cat.slug}</Badge>
                  </div>
                  {cat.description && <p className="text-xs text-muted-foreground truncate">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => handleEdit(cat)}>
                    <Icon icon="solar:pen-bold-duotone" className="text-sm" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDelete(cat.id)}>
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-sm" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppDashed>
    </div>
  );
}
