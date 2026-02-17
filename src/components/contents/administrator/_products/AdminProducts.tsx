import { useState, useEffect, useCallback } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "bg-yellow-500" },
  published: { label: "Đã xuất bản", color: "bg-emerald-500" },
  archived: { label: "Đã lưu trữ", color: "bg-gray-500" },
};

const typeMap: Record<string, string> = {
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
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.api.admin.products.get({
        query: {
          page: String(page),
          limit: "20",
          search: search || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
        },
      });
      if (data?.success) {
        setProducts((data as any).products || []);
        setPagination((data as any).pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch {
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      const { data } = await api.api.admin.products({ id }).delete();
      if (data?.success) { toast.success("Đã xóa sản phẩm"); fetchProducts(pagination.page); }
      else toast.error((data as any)?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:box-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Sản phẩm</h1>
              <p className="text-xs text-muted-foreground">{pagination.total} sản phẩm</p>
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => navigate("/admin/products/new")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm sản phẩm
          </Button>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input placeholder="Tìm sản phẩm..." className="pl-8 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="archived">Đã lưu trữ</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Loại</SelectItem>
              <SelectItem value="free">Miễn phí</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:box-bold-duotone" className="text-4xl text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon icon="solar:box-bold-duotone" className="text-lg text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                    {product.isFeatured && <Icon icon="solar:star-bold" className="text-amber-500 text-xs shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{product.tagline || product.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-medium text-foreground">{formatPrice(product.price, product.currency)}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{typeMap[product.type] || product.type}</Badge>
                  <div className="flex items-center gap-1">
                    <div className={`size-2 rounded-full ${statusMap[product.status]?.color || "bg-gray-500"}`} />
                    <span className="text-[10px] text-muted-foreground">{statusMap[product.status]?.label || product.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon" className="size-7" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                    <Icon icon="solar:pen-bold-duotone" className="text-sm" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDelete(product.id)}>
                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-sm" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AppDashed>

      {pagination.totalPages > 1 && (
        <AppDashed noTopBorder padding="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Trang {pagination.page} / {pagination.totalPages}</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={pagination.page <= 1} onClick={() => fetchProducts(pagination.page - 1)}>
                <Icon icon="solar:arrow-left-linear" className="text-sm mr-1" /> Trước
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchProducts(pagination.page + 1)}>
                Sau <Icon icon="solar:arrow-right-linear" className="text-sm ml-1" />
              </Button>
            </div>
          </div>
        </AppDashed>
      )}
    </div>
  );
}
