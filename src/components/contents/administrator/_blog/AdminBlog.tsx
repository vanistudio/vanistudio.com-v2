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
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  category: string | null;
  status: string;
  viewCount: number;
  readingTime: number | null;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Nháp", color: "bg-yellow-500" },
  published: { label: "Đã xuất bản", color: "bg-emerald-500" },
  archived: { label: "Đã lưu trữ", color: "bg-zinc-400" },
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

export default function AdminBlog() {
  usePageTitle("Quản lý Blog");
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (api.api.admin.blog as any).get({
        query: { page: "1", limit: "500" },
      });
      if (data?.success) setPosts(data.posts || []);
    } catch {
      toast.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa bài viết này?")) return;
    try {
      const { data } = await (api.api.admin.blog as any)({ id }).delete();
      if (data?.success) { toast.success("Đã xóa bài viết"); fetchPosts(); }
      else toast.error(data?.error || "Thất bại");
    } catch { toast.error("Lỗi kết nối"); }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!`${p.title} ${p.excerpt || ""} ${p.slug}`.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [posts, search, statusFilter]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const draft = posts.filter((p) => p.status === "draft").length;
    const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);
    return [
      { label: "Tổng bài viết", value: total, icon: "solar:document-text-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Đã xuất bản", value: published, icon: "solar:check-circle-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Bản nháp", value: draft, icon: "solar:pen-new-square-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
      { label: "Tổng lượt xem", value: totalViews.toLocaleString(), icon: "solar:eye-bold-duotone", bgColor: "bg-violet-500/10", textColor: "text-violet-500" },
    ];
  }, [posts]);

  const activeFilterCount = statusFilter !== "all" ? 1 : 0;

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:document-text-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Blog</h1>
              <p className="text-xs text-muted-foreground">{posts.length} bài viết</p>
            </div>
          </div>
          <Button size="sm" className="text-xs gap-1.5" onClick={() => navigate("/admin/blog/create")}>
            <Icon icon="solar:add-circle-bold-duotone" className="text-sm" />
            Viết bài mới
          </Button>
        </div>
      </AppDashed>
      <AdminStats items={stats} />
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input placeholder="Tìm bài viết..." className="pl-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-xs gap-1.5 shrink-0">
                <Icon icon="solar:filter-bold-duotone" className="text-sm" />
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="size-4 p-0 flex items-center justify-center text-[9px] rounded-full ml-0.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[240px] p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <button onClick={() => setStatusFilter("all")} className="text-[11px] text-primary hover:underline cursor-pointer">Xóa</button>
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
      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:document-text-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search || statusFilter !== "all" ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết nào"}
            </p>
            {!search && statusFilter === "all" && (
              <Button size="sm" variant="outline" className="text-xs gap-1.5 mt-2" onClick={() => navigate("/admin/blog/create")}>
                <Icon icon="solar:pen-new-square-bold-duotone" className="text-sm" />
                Viết bài đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="w-max min-w-full">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              <div className="w-12 shrink-0" />
              <div className="flex-1">Bài viết</div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-[80px]">Trạng thái</div>
                <div className="w-[60px] text-right">Lượt xem</div>
                <div className="w-[50px] text-right">Đọc</div>
                <div className="w-[70px]">Ngày tạo</div>
              </div>
              <div className="w-8 shrink-0" />
            </div>
            <div className="divide-y divide-border">
              {filteredPosts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group whitespace-nowrap">
                  <div className="w-12 h-8 rounded-md bg-muted overflow-hidden shrink-0">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon icon="solar:document-text-bold-duotone" className="text-sm text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{p.title}</span>
                      {p.isFeatured && <Icon icon="solar:star-bold" className="text-amber-500 text-xs shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{p.excerpt || p.slug}</span>
                      {p.category && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">{p.category}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-[80px]">
                      <div className="flex items-center gap-1.5">
                        <div className={`size-2 rounded-full ${statusMap[p.status]?.color || "bg-gray-500"}`} />
                        <span className="text-[11px] text-muted-foreground">{statusMap[p.status]?.label || p.status}</span>
                      </div>
                    </div>
                    <div className="w-[60px] text-right">
                      <span className="text-xs text-muted-foreground tabular-nums">{p.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="w-[50px] text-right">
                      <span className="text-xs text-muted-foreground">{p.readingTime || 0}p</span>
                    </div>
                    <div className="w-[70px]">
                      <span className="text-[11px] text-muted-foreground/70">{timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <Icon icon="solar:menu-dots-bold" className="text-base" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onClick={() => navigate(`/admin/blog/${p.id}/edit`)}>
                        <Icon icon="solar:pen-bold-duotone" className="mr-2 text-base" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(p.id)}>
                        <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
                        Xóa bài viết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredPosts.length} / {posts.length} bài viết
              </span>
            </div>
          </div>
        )}
      </AppDashed>
    </div>
  );
}
