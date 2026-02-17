import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/vani/datatable";
import AdminStats from "@/components/vani/AdminStats";
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

  // ── Stats ──
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const withIcon = categories.filter((c) => c.icon).length;
    const withDesc = categories.filter((c) => c.description).length;
    return [
      { label: "Tổng chuyên mục", value: total, icon: "solar:folder-bold-duotone", color: "bg-blue-500/10" },
      { label: "Đang hoạt động", value: active, icon: "solar:check-circle-bold-duotone", color: "bg-emerald-500/10" },
      { label: "Có icon", value: withIcon, icon: "solar:pallete-2-bold-duotone", color: "bg-violet-500/10" },
      { label: "Có mô tả", value: withDesc, icon: "solar:document-text-bold-duotone", color: "bg-amber-500/10" },
    ];
  }, [categories]);

  // ── Columns ──
  const columns = useMemo<ColumnDef<Category>[]>(() => [
    {
      accessorKey: "name",
      header: "Chuyên mục",
      enableHiding: false,
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon icon={cat.icon || "solar:folder-bold-duotone"} className="text-base text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{cat.slug}</Badge>
              </div>
              {cat.description && <p className="text-xs text-muted-foreground truncate max-w-[300px]">{cat.description}</p>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      size: 110,
      cell: ({ getValue }) => {
        const active = getValue<boolean>();
        return (
          <div className="flex items-center gap-1.5">
            <div className={`size-2 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-xs text-muted-foreground">{active ? "Hoạt động" : "Ẩn"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "sortOrder",
      header: "Thứ tự",
      size: 80,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground font-mono">#{getValue<number>()}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      size: 120,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(getValue<string>()).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      id: "actions",
      size: 50,
      enableHiding: false,
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <Icon icon="solar:menu-dots-bold" className="text-base" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleEdit(cat)}>
                <Icon icon="solar:pen-bold-duotone" className="mr-2 text-base" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(cat.id)}>
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

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

      {/* Stats */}
      <AdminStats items={stats} />

      {/* Inline Form */}
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
              <div className="flex items-center gap-2">
                <Input className="h-8 text-sm flex-1" placeholder="solar:code-square-bold-duotone" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} />
                {form.icon && <Icon icon={form.icon} className="text-lg text-muted-foreground shrink-0" />}
              </div>
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

      {/* DataTable */}
      <AppDashed noTopBorder padding="p-0">
        <DataTable
          columns={columns}
          data={categories}
          searchKey="name"
          searchPlaceholder="Tìm chuyên mục..."
          compact
          showPagination={false}
          emptyIcon="solar:folder-bold-duotone"
          emptyMessage="Chưa có chuyên mục nào"
        />
      </AppDashed>
    </div>
  );
}
