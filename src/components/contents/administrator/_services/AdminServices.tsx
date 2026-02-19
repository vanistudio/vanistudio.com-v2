import { useState, useEffect, useCallback } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import AdminStats from "@/components/vani/AdminStats";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  icon: string | null;
  thumbnail: string | null;
  price: string;
  minPrice: string | null;
  maxPrice: string | null;
  currency: string;
  priceUnit: string | null;
  status: string;
  isFeatured: boolean;
  estimatedDays: number | null;
  sortOrder: number;
  createdAt: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  published: { label: "Công khai", variant: "default" },
  draft: { label: "Nháp", variant: "secondary" },
  archived: { label: "Lưu trữ", variant: "outline" },
};

function formatPrice(price: string, currency: string) {
  const num = Number(price);
  if (!num) return "Liên hệ";
  return num.toLocaleString("vi-VN") + " " + currency;
}

export default function AdminServices() {
  usePageTitle("Quản lý dịch vụ");
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, featured: 0 });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: "100" };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const { data } = await (api.api.admin.services as any).get({ query: params });
      if (data?.success) {
        setServices(data.services || []);
        const all = data.services || [];
        setStats({
          total: data.pagination?.total || all.length,
          published: all.filter((s: Service) => s.status === "published").length,
          draft: all.filter((s: Service) => s.status === "draft").length,
          featured: all.filter((s: Service) => s.isFeatured).length,
        });
      }
    } catch {
      toast.error("Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa dịch vụ này?")) return;
    try {
      const { data } = await (api.api.admin.services as any)({ id }).delete();
      if (data?.success) { toast.success("Đã xóa"); fetchServices(); }
      else toast.error(data?.error || "Xóa thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  return (
    <div className="flex flex-col w-full">
      <AdminStats items={[
        { label: "Tổng dịch vụ", value: stats.total, icon: "solar:widget-5-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
        { label: "Công khai", value: stats.published, icon: "solar:eye-bold-duotone", bgColor: "bg-green-500/10", textColor: "text-green-500" },
        { label: "Bản nháp", value: stats.draft, icon: "solar:pen-new-square-bold-duotone", bgColor: "bg-yellow-500/10", textColor: "text-yellow-500" },
        { label: "Nổi bật", value: stats.featured, icon: "solar:star-bold-duotone", bgColor: "bg-purple-500/10", textColor: "text-purple-500" },
      ]} />

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input className="text-sm pl-8 h-8" placeholder="Tìm dịch vụ..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Công khai</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="archived">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="text-xs gap-1.5 h-8 ml-auto" onClick={() => navigate("/admin/services/create")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm dịch vụ
          </Button>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Icon icon="solar:widget-5-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Chưa có dịch vụ nào</p>
          </div>
        ) : (
          <>
            <div className="w-max min-w-full">
              <div className="grid grid-cols-[48px_1fr_140px_100px_100px_48px] items-center px-4 py-2.5 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground whitespace-nowrap">
                <span></span>
                <span>Dịch vụ</span>
                <span>Giá</span>
                <span>Trạng thái</span>
                <span>Thời gian</span>
                <span></span>
              </div>
              {services.map((service) => (
                <div key={service.id} className="grid grid-cols-[48px_1fr_140px_100px_100px_48px] items-center px-4 py-2.5 border-b border-border hover:bg-muted/20 transition-colors whitespace-nowrap">
                  <div className="w-9 h-9 rounded-md border border-border overflow-hidden bg-muted/20 shrink-0 flex items-center justify-center">
                    {service.icon ? (
                      <Icon icon={service.icon} className="text-lg text-primary" />
                    ) : service.thumbnail ? (
                      <img src={service.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="solar:widget-5-bold-duotone" className="text-sm text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-title">{service.name}</span>
                      {service.isFeatured && <Icon icon="solar:star-bold" className="text-xs text-yellow-500" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{service.tagline || service.slug}</p>
                  </div>
                  <div className="text-xs">
                    {service.minPrice && service.maxPrice ? (
                      <span className="text-title font-medium">{formatPrice(service.minPrice, service.currency)} - {formatPrice(service.maxPrice, service.currency)}</span>
                    ) : service.minPrice ? (
                      <span className="text-title font-medium">Từ {formatPrice(service.minPrice, service.currency)}</span>
                    ) : (
                      <span className="text-title font-medium">{formatPrice(service.price, service.currency)}</span>
                    )}
                    {service.priceUnit && <span className="text-muted-foreground ml-0.5">{service.priceUnit}</span>}
                  </div>
                  <Badge variant={statusMap[service.status]?.variant || "secondary"} className="text-[10px] w-fit">
                    {statusMap[service.status]?.label || service.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {service.estimatedDays ? `~${service.estimatedDays} ngày` : "—"}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <Icon icon="solar:menu-dots-bold" className="text-sm" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => navigate(`/admin/services/${service.id}/edit`)}>
                        <Icon icon="solar:pen-bold-duotone" className="text-sm" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => handleDelete(service.id)}>
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="text-sm" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </>
        )}
      </AppDashed>
    </div>
  );
}
