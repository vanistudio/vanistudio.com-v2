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

interface Project {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  thumbnail: string | null;
  status: string;
  type: string;
  category: string | null;
  techStack: string[];
  isFeatured: boolean;
  liveUrl: string | null;
  sourceUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isOngoing: boolean;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "bg-yellow-500" },
  published: { label: "Đã xuất bản", color: "bg-emerald-500" },
  archived: { label: "Đã lưu trữ", color: "bg-zinc-400" },
};

const typeMap: Record<string, string> = {
  personal: "Cá nhân",
  freelance: "Freelance",
  "open-source": "Open Source",
  collaboration: "Hợp tác",
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

export default function AdminProjects() {
  usePageTitle("Quản lý Dự án");
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (api.api.admin.projects as any).get({
        query: { page: "1", limit: "500" },
      });
      if (data?.success) setProjects(data.projects || []);
    } catch {
      toast.error("Không thể tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa dự án này?")) return;
    try {
      const { data } = await (api.api.admin.projects as any)({ id }).delete();
      if (data?.success) { toast.success("Đã xóa dự án"); fetchProjects(); }
      else toast.error(data?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!`${p.name} ${p.tagline || ""} ${p.slug}`.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      return true;
    });
  }, [projects, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = projects.length;
    const published = projects.filter((p) => p.status === "published").length;
    const draft = projects.filter((p) => p.status === "draft").length;
    const featured = projects.filter((p) => p.isFeatured).length;
    return [
      { label: "Tổng dự án", value: total, icon: "solar:code-square-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Đã xuất bản", value: published, icon: "solar:check-circle-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Bản nháp", value: draft, icon: "solar:pen-new-square-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
      { label: "Nổi bật", value: featured, icon: "solar:star-bold-duotone", bgColor: "bg-violet-500/10", textColor: "text-violet-500" },
    ];
  }, [projects]);

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);
  const clearFilters = () => { setStatusFilter("all"); setTypeFilter("all"); };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:code-square-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Dự án</h1>
              <p className="text-xs text-muted-foreground">{projects.length} dự án</p>
            </div>
          </div>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => navigate("/admin/projects/create")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm dự án
          </Button>
        </div>
      </AppDashed>
      <AdminStats items={stats} />
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm dự án..."
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
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Loại</span>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="personal">Cá nhân</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="open-source">Open Source</SelectItem>
                      <SelectItem value="collaboration">Hợp tác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </AppDashed>

      {/* Project List */}
      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:code-square-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "Không tìm thấy dự án phù hợp"
                : "Chưa có dự án nào"}
            </p>
          </div>
        ) : (
          <div className="w-max min-w-full">
            {/* Table header */}
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              <div className="w-10 shrink-0" />
              <div className="flex-1">Dự án</div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-[70px]">Loại</div>
                <div className="w-[80px]">Trạng thái</div>
                <div className="w-[80px]">Links</div>
                <div className="w-[60px] text-right">Ngày tạo</div>
              </div>
              <div className="w-8 shrink-0" />
            </div>

            {/* Project rows */}
            <div className="divide-y divide-border">
              {filteredProjects.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group whitespace-nowrap">
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="solar:code-square-bold-duotone" className="text-base text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{p.name}</span>
                      {p.isFeatured && <Icon icon="solar:star-bold" className="text-amber-500 text-xs shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground block mt-0.5">{p.tagline || p.slug}</span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-[70px]">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{typeMap[p.type] || p.type}</Badge>
                    </div>
                    <div className="w-[80px]">
                      <div className="flex items-center gap-1.5">
                        <div className={`size-2 rounded-full ${statusMap[p.status]?.color || "bg-gray-500"}`} />
                        <span className="text-[11px] text-muted-foreground">{statusMap[p.status]?.label || p.status}</span>
                      </div>
                    </div>
                    <div className="w-[80px] flex items-center gap-1.5">
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Icon icon="solar:global-bold-duotone" className="text-sm" />
                        </a>
                      )}
                      {p.sourceUrl && (
                        <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Icon icon="mdi:github" className="text-sm" />
                        </a>
                      )}
                    </div>
                    <div className="w-[60px] text-right">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground tabular-nums">{timeAgo(p.createdAt)}</span>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {new Date(p.createdAt).toLocaleDateString("vi-VN")}
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
                      <DropdownMenuItem onClick={() => navigate(`/admin/projects/${p.id}/edit`)}>
                        <Icon icon="solar:pen-bold-duotone" className="mr-2 text-base" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p.id)}>
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
                        Xóa dự án
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredProjects.length} / {projects.length} dự án
              </span>
            </div>
          </div>
        )}
      </AppDashed>
    </div>
  );
}
