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

interface License {
  id: string;
  key: string;
  productId: string | null;
  productName: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  status: string;
  maxActivations: number;
  currentActivations: number;
  notes: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  unused: { label: "Chưa dùng", color: "bg-zinc-400" },
  active: { label: "Đang dùng", color: "bg-emerald-500" },
  expired: { label: "Hết hạn", color: "bg-amber-500" },
  revoked: { label: "Đã thu hồi", color: "bg-red-500" },
};

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

export default function AdminLicenses() {
  usePageTitle("Quản lý License");
  const navigate = useNavigate();

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (api.api.admin.licenses as any).get({
        query: { page: "1", limit: "500" },
      });
      if (data?.success) setLicenses(data.licenses || []);
    } catch {
      toast.error("Không thể tải danh sách license");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa license này?")) return;
    try {
      const { data } = await (api.api.admin.licenses as any)({ id }).delete();
      if (data?.success) { toast.success("Đã xóa"); fetchLicenses(); }
      else toast.error(data?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Thu hồi license này?")) return;
    try {
      const { data } = await (api.api.admin.licenses as any)({ id }).revoke.patch();
      if (data?.success) { toast.success("Đã thu hồi"); fetchLicenses(); }
      else toast.error(data?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Đã copy license key");
  };

  const filteredLicenses = useMemo(() => {
    return licenses.filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        if (!`${l.key} ${l.productName} ${l.userEmail || ""} ${l.userName || ""}`.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      return true;
    });
  }, [licenses, search, statusFilter]);

  const stats = useMemo(() => {
    const total = licenses.length;
    const active = licenses.filter((l) => l.status === "active").length;
    const unused = licenses.filter((l) => l.status === "unused").length;
    const revoked = licenses.filter((l) => l.status === "revoked").length;
    return [
      { label: "Tổng license", value: total, icon: "solar:key-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Đang dùng", value: active, icon: "solar:check-circle-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Chưa dùng", value: unused, icon: "solar:clock-circle-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
      { label: "Đã thu hồi", value: revoked, icon: "solar:close-circle-bold-duotone", bgColor: "bg-red-500/10", textColor: "text-red-500" },
    ];
  }, [licenses]);

  const activeFilterCount = statusFilter !== "all" ? 1 : 0;
  const clearFilters = () => { setStatusFilter("all"); };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:key-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">License Key</h1>
              <p className="text-xs text-muted-foreground">{licenses.length} license</p>
            </div>
          </div>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => navigate("/admin/licenses/create")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Tạo license
          </Button>
        </div>
      </AppDashed>
      <AdminStats items={stats} />
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm license key, sản phẩm, email..."
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
                      <SelectItem value="active">Đang dùng</SelectItem>
                      <SelectItem value="unused">Chưa dùng</SelectItem>
                      <SelectItem value="expired">Hết hạn</SelectItem>
                      <SelectItem value="revoked">Đã thu hồi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : filteredLicenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:key-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Không tìm thấy license phù hợp"
                : "Chưa có license nào"}
            </p>
          </div>
        ) : (
          <div className="w-max min-w-full">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              <div className="w-[200px]">License Key</div>
              <div className="flex-1">Sản phẩm</div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-[140px]">Người dùng</div>
                <div className="w-[80px]">Trạng thái</div>
                <div className="w-[60px] text-right">Kích hoạt</div>
                <div className="w-[70px] text-right">Ngày tạo</div>
              </div>
              <div className="w-8 shrink-0" />
            </div>

            <div className="divide-y divide-border">
              {filteredLicenses.map((l) => (
                <div key={l.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group whitespace-nowrap">
                  <div className="w-[200px]">
                    <button
                      onClick={() => copyKey(l.key)}
                      className="flex items-center gap-1.5 text-xs font-mono text-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      <Icon icon="solar:key-bold-duotone" className="text-sm text-muted-foreground shrink-0" />
                      {l.key}
                      <Icon icon="solar:copy-bold-duotone" className="text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">{l.productName}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-[140px]">
                      {l.userId ? (
                        <div>
                          <span className="text-xs font-medium text-foreground block">{l.userName || "—"}</span>
                          <span className="text-[10px] text-muted-foreground">{l.userEmail}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Chưa gán</span>
                      )}
                    </div>
                    <div className="w-[80px]">
                      <div className="flex items-center gap-1.5">
                        <div className={`size-2 rounded-full ${statusMap[l.status]?.color || "bg-gray-500"}`} />
                        <span className="text-[11px] text-muted-foreground">{statusMap[l.status]?.label || l.status}</span>
                      </div>
                    </div>
                    <div className="w-[60px] text-right">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {l.currentActivations}/{l.maxActivations}
                      </span>
                    </div>
                    <div className="w-[70px] text-right">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground tabular-nums">{timeAgo(l.createdAt)}</span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                            {l.expiresAt && ` • Hết hạn: ${new Date(l.expiresAt).toLocaleDateString("vi-VN")}`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Icon icon="solar:menu-dots-bold" className="text-base" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => copyKey(l.key)}>
                        <Icon icon="solar:copy-bold-duotone" className="mr-2 text-base" />
                        Copy Key
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/licenses/${l.id}/edit`)}>
                        <Icon icon="solar:pen-bold-duotone" className="mr-2 text-base" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      {l.status === "active" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-amber-600 focus:text-amber-600" onClick={() => handleRevoke(l.id)}>
                            <Icon icon="solar:close-circle-bold-duotone" className="mr-2 text-base" />
                            Thu hồi
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(l.id)}>
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredLicenses.length} / {licenses.length} license
              </span>
            </div>
          </div>
        )}
      </AppDashed>
    </div>
  );
}
