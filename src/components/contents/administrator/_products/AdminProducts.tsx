import { useState, useEffect, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, DataTableToolbar, DataTableFacetedFilter } from "@/components/vani/datatable";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  thumbnail: string | null;
  type: string;
  status: string;
  price: string;
  salePrice: string | null;
  currency: string;
  viewCount: number;
  downloadCount: number;
  isFeatured: boolean;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  archived: "Đã lưu trữ",
};

const statusColors: Record<string, string> = {
  draft: "bg-yellow-500",
  published: "bg-emerald-500",
  archived: "bg-gray-500",
};

const typeLabels: Record<string, string> = {
  free: "Miễn phí",
  premium: "Premium",
  enterprise: "Enterprise",
};

function formatPrice(price: string, currency: string) {
  const num = parseInt(price);
  if (num === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN").format(num) + " " + currency;
}

export default function AdminProducts() {
  usePageTitle("Quản lý Sản phẩm");
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.api.admin.products.get({
        query: { page: "1", limit: "500" },
      });
      if (data?.success) {
        setProducts((data as any).products || []);
      }
    } catch {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      const { data } = await api.api.admin.products({ id }).delete();
      if (data?.success) { toast.success("Đã xóa sản phẩm"); fetchProducts(); }
      else toast.error((data as any)?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  // ── Stats ──
  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.status === "published").length;
    const draft = products.filter((p) => p.status === "draft").length;
    const featured = products.filter((p) => p.isFeatured).length;
    return [
      { label: "Tổng sản phẩm", value: total, icon: "solar:box-bold-duotone", color: "bg-blue-500/10" },
      { label: "Đã xuất bản", value: published, icon: "solar:check-circle-bold-duotone", color: "bg-emerald-500/10" },
      { label: "Bản nháp", value: draft, icon: "solar:pen-new-square-bold-duotone", color: "bg-yellow-500/10" },
      { label: "Nổi bật", value: featured, icon: "solar:star-bold-duotone", color: "bg-amber-500/10" },
    ];
  }, [products]);

  // ── Columns ──
  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: "name",
      header: "Sản phẩm",
      enableHiding: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
              {p.thumbnail ? (
                <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon icon="solar:box-bold-duotone" className="text-base text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                {p.isFeatured && <Icon icon="solar:star-bold" className="text-amber-500 text-xs shrink-0" />}
              </div>
              <span className="text-xs text-muted-foreground truncate block">{p.tagline || p.slug}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Loại",
      size: 100,
      cell: ({ getValue }) => {
        const type = getValue<string>();
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{typeLabels[type] || type}</Badge>;
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "price",
      header: "Giá",
      size: 120,
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">
          {formatPrice(row.original.price, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      size: 120,
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <div className="flex items-center gap-1.5">
            <div className={`size-2 rounded-full ${statusColors[status] || "bg-gray-500"}`} />
            <span className="text-xs text-muted-foreground">{statusLabels[status] || status}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "viewCount",
      header: "Lượt xem",
      size: 90,
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon icon="solar:eye-bold-duotone" className="text-sm" />
          {getValue<number>().toLocaleString("vi-VN")}
        </div>
      ),
    },
    {
      accessorKey: "downloadCount",
      header: "Tải về",
      size: 90,
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon icon="solar:download-minimalistic-bold-duotone" className="text-sm" />
          {getValue<number>().toLocaleString("vi-VN")}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      size: 110,
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
        const p = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <Icon icon="solar:menu-dots-bold" className="text-base" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
                <Icon icon="solar:pen-bold-duotone" className="mr-2 text-base" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p.id)}>
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
              <Icon icon="solar:box-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Sản phẩm</h1>
              <p className="text-xs text-muted-foreground">{products.length} sản phẩm</p>
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => navigate("/admin/products/new")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm sản phẩm
          </Button>
        </div>
      </AppDashed>

      {/* Stats */}
      <AdminStats items={stats} />

      {/* DataTable */}
      <AppDashed noTopBorder padding="p-0">
        <DataTable
          columns={columns}
          data={products}
          searchPlaceholder="Tìm sản phẩm..."
          compact
          emptyIcon="solar:box-bold-duotone"
          emptyMessage="Chưa có sản phẩm nào"
          toolbar={(table) => (
            <DataTableToolbar table={table} searchPlaceholder="Tìm sản phẩm...">
              <DataTableFacetedFilter
                column={table.getColumn("status")}
                title="Trạng thái"
                options={[
                  { label: "Nháp", value: "draft", icon: "solar:pen-new-square-bold-duotone" },
                  { label: "Đã xuất bản", value: "published", icon: "solar:check-circle-bold-duotone" },
                  { label: "Đã lưu trữ", value: "archived", icon: "solar:archive-bold-duotone" },
                ]}
              />
              <DataTableFacetedFilter
                column={table.getColumn("type")}
                title="Loại"
                options={[
                  { label: "Miễn phí", value: "free" },
                  { label: "Premium", value: "premium" },
                  { label: "Enterprise", value: "enterprise" },
                ]}
              />
            </DataTableToolbar>
          )}
        />
      </AppDashed>
    </div>
  );
}
