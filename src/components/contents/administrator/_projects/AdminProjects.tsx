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

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  published: { label: "Công khai", variant: "default" },
  draft: { label: "Nháp", variant: "secondary" },
  archived: { label: "Lưu trữ", variant: "outline" },
};

const typeMap: Record<string, string> = {
  personal: "Cá nhân",
  freelance: "Freelance",
  "open-source": "Open Source",
  collaboration: "Hợp tác",
};

export default function AdminProjects() {
  usePageTitle("Quản lý dự án");
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, featured: 0 });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: "100" };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;
      const { data } = await (api.api.admin.projects as any).get({ query: params });
      if (data?.success) {
        setProjects(data.projects || []);
        const all = data.projects || [];
        setStats({
          total: data.pagination?.total || all.length,
          published: all.filter((p: Project) => p.status === "published").length,
          draft: all.filter((p: Project) => p.status === "draft").length,
          featured: all.filter((p: Project) => p.isFeatured).length,
        });
      }
    } catch {
      toast.error("Không thể tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa dự án này?")) return;
    try {
      const { data } = await (api.api.admin.projects as any)({ id }).delete();
      if (data?.success) { toast.success("Đã xóa"); fetchProjects(); }
      else toast.error(data?.error || "Xóa thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  return (
    <div className="flex flex-col w-full">
      <AdminStats items={[
        { label: "Tổng dự án", value: stats.total, icon: "solar:code-square-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
        { label: "Công khai", value: stats.published, icon: "solar:eye-bold-duotone", bgColor: "bg-green-500/10", textColor: "text-green-500" },
        { label: "Bản nháp", value: stats.draft, icon: "solar:pen-new-square-bold-duotone", bgColor: "bg-yellow-500/10", textColor: "text-yellow-500" },
        { label: "Nổi bật", value: stats.featured, icon: "solar:star-bold-duotone", bgColor: "bg-purple-500/10", textColor: "text-purple-500" },
      ]} />

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input className="text-sm pl-8 h-8" placeholder="Tìm dự án..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="personal">Cá nhân</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="open-source">Open Source</SelectItem>
              <SelectItem value="collaboration">Hợp tác</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="text-xs gap-1.5 h-8 ml-auto" onClick={() => navigate("/admin/projects/create")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Thêm dự án
          </Button>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Icon icon="solar:code-square-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Chưa có dự án nào</p>
          </div>
        ) : (
          <>
            <div className="w-max min-w-full">
              <div className="grid grid-cols-[48px_1fr_160px_100px_100px_120px_120px_48px] items-center px-4 py-2.5 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground whitespace-nowrap">
                <span></span>
                <span>Dự án</span>
                <span>Tech Stack</span>
                <span>Loại</span>
                <span>Trạng thái</span>
                <span>Links</span>
                <span>Ngày tạo</span>
                <span></span>
              </div>
              {projects.map((project) => (
                <div key={project.id} className="grid grid-cols-[48px_1fr_160px_100px_100px_120px_120px_48px] items-center px-4 py-2.5 border-b border-border hover:bg-muted/20 transition-colors whitespace-nowrap">
                  <div className="w-9 h-9 rounded-md border border-border overflow-hidden bg-muted/20 shrink-0">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="solar:code-square-bold-duotone" className="text-sm text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 px-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-title">{project.name}</span>
                      {project.isFeatured && <Icon icon="solar:star-bold" className="text-xs text-yellow-500" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{project.tagline || project.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-[160px]">
                    {(project.techStack || []).slice(0, 3).map((t, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">{t}</Badge>
                    ))}
                    {(project.techStack || []).length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">+{project.techStack.length - 3}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{typeMap[project.type] || project.type}</span>
                  <Badge variant={statusMap[project.status]?.variant || "secondary"} className="text-[10px] w-fit">
                    {statusMap[project.status]?.label || project.status}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <Icon icon="solar:global-bold-duotone" className="text-sm" />
                      </a>
                    )}
                    {project.sourceUrl && (
                      <a href={project.sourceUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <Icon icon="mdi:github" className="text-sm" />
                      </a>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <Icon icon="solar:menu-dots-bold" className="text-sm" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => navigate(`/admin/projects/${project.id}/edit`)}>
                        <Icon icon="solar:pen-bold-duotone" className="text-sm" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => handleDelete(project.id)}>
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
