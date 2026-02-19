import { useState, useEffect, useCallback, useMemo } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminStats from "@/components/vani/AdminStats";
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

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "bg-yellow-500" },
  published: { label: "Đã xuất bản", color: "bg-emerald-500" },
  archived: { label: "Đã lưu trữ", color: "bg-zinc-400" },
};

function formatPrice(price: string, currency: string) {
  const num = parseInt(price);
  if (num === 0) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN").format(num) + " " + currency;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins}p trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

export default function AdminServices() {
  usePageTitle("Quản lý Dịch vụ");
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (api.api.admin.services as any).get({
        query: { page: "1", limit: "500" },
      });
      if (data?.success) setServices(data.services || []);
    } catch {
      toast.error("Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa dịch vụ này?")) return;
    try {
      const { data } = await (api.api.admin.services as any)({ id }).delete();
      if (data?.success) { toast.success("Đã xóa dịch vụ"); fetchServices(); }
      else toast.error(data?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!`${s.name} ${s.tagline || ""} ${s.slug}`.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [services, search, statusFilter]);

  const stats = useMemo(() => {
    const total = services.length;
    const published = services.filter((s) => s.status === "published").length;
    const draft = services.filter((s) => s.status === "draft").length;
    const featured = services.filter((s) => s.isFeatured).length;
    return [
      { label: "Tổng dịch vụ", value: total, icon: "solar:widget-5-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Đã xuất bản", value: published, icon: "solar:check-circle-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Bản nháp", value: draft, icon: "solar:pen-new-square-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
      { label: "Nổi bật", value: featured, icon: "solar:star-bold-duotone", bgColor: "bg-violet-500/10", textColor: "text-violet-500" },
    ];
  }, [services]);

  const activeFilterCount = statusFilter !== "all" ? 1 : 0;
  const clearFilters = () => { setStatusFilter("all"); };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:widget-5-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Dịch vụ</h1>
              <p className="text-xs text-muted-foreground">{services.length} dịch vụ</p>
            </div>
          </div>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => navigate("/admin/services/create")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm dịch vụ
          </Button>
        </div>
      </AppDashed>
      <AdminStats items={stats} />
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm dịch vụ..."
              className="pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-xs gap-1.5 shrink-0">
                <Icon icon="solar:filter-bold-duotone" className="text-sm" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[240px] p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-[11px] text-primary hover:underline cursor-pointer">
                      Xóa tất cả
                    </button>
                  )}
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Trạng thái</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="archived">Đã lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </AppDashed>

      {/* Service List */}
      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:widget-5-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Không tìm thấy dịch vụ phù hợp"
                : "Chưa có dịch vụ nào"}
            </p>
          </div>
        ) : (
          <div className="w-max min-w-full">
            {/* Table header */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              <div className="w-10 shrink-0" />
              <div className="flex-1">Dịch vụ</div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-[120px]">Giá</div>
                <div className="w-[80px]">Trạng thái</div>
                <div className="w-[80px] text-right">Thời gian</div>
              </div>
              <div className="w-8 shrink-0" />
            </div>

            {/* Service rows */}
            <div className="divide-y divide-border">
              {filteredServices.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group whitespace-nowrap">
                  {/* Icon/Thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                    {s.icon ? (
                      <Icon icon={s.icon} className="text-lg text-primary" />
                    ) : s.thumbnail ? (
                      <img src={s.thumbnail} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <Icon icon="solar:widget-5-bold-duotone" className="text-base text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{s.name}</span>
                      {s.isFeatured && <Icon icon="solar:star-bold" className="text-amber-500 text-xs shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">{s.tagline || s.slug}</span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-[120px]">
                      <span className="text-xs font-medium text-foreground">
                        {s.minPrice && s.maxPrice
                          ? `${formatPrice(s.minPrice, s.currency)} - ${formatPrice(s.maxPrice, s.currency)}`
                          : s.minPrice
                            ? `Từ ${formatPrice(s.minPrice, s.currency)}`
                            : formatPrice(s.price, s.currency)}
                      </span>
                      {s.priceUnit && <span className="text-[10px] text-muted-foreground ml-0.5">{s.priceUnit}</span>}
                    </div>
                    <div className="w-[80px]">
                      <div className="flex items-center gap-1.5">
                        <div className={`size-2 rounded-full ${statusMap[s.status]?.color || "bg-gray-500"}`} />
                        <span className="text-[11px] text-muted-foreground">{statusMap[s.status]?.label || s.status}</span>
                      </div>
                    </div>
                    <div className="w-[80px] text-right">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {s.estimatedDays ? `~${s.estimatedDays}d` : "—"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {timeAgo(s.createdAt)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Icon icon="solar:menu-dots-bold" className="text-base" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => navigate(`/admin/services/${s.id}/edit`)}>
                        <Icon icon="solar:pen-bold-duotone" className="mr-2 text-base" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(s.id)}>
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
                        Xóa dịch vụ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredServices.length} / {services.length} dịch vụ
              </span>
            </div>
          </div>
        )}
      </AppDashed>
    </div>
  );
}
