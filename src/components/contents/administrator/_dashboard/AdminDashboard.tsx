import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Separator } from "@/components/ui/separator";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface Counts {
  users: number;
  categories: number;
  products: { total: number; published: number };
  services: { total: number; published: number };
  blog: { total: number; published: number };
  projects: { total: number; published: number };
  licenses: { total: number; active: number; unused: number };
}

interface RecentItem {
  id: string;
  name?: string;
  title?: string;
  key?: string;
  productName?: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  published: "bg-emerald-500", draft: "bg-zinc-400", archived: "bg-amber-500",
  active: "bg-emerald-500", unused: "bg-zinc-400", revoked: "bg-red-500", expired: "bg-amber-500",
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
  return `${Math.floor(days / 30)} tháng trước`;
}

const contentLinks = [
  { label: "Sản phẩm", icon: "solar:box-bold-duotone", href: "/admin/products", createHref: "/admin/products/create", key: "products" },
  { label: "Dịch vụ", icon: "solar:widget-5-bold-duotone", href: "/admin/services", createHref: "/admin/services/create", key: "services" },
  { label: "Blog", icon: "solar:document-text-bold-duotone", href: "/admin/blog", createHref: "/admin/blog/create", key: "blog" },
  { label: "Dự án", icon: "solar:code-bold-duotone", href: "/admin/projects", createHref: "/admin/projects/create", key: "projects" },
  { label: "License", icon: "solar:key-bold-duotone", href: "/admin/licenses", createHref: "/admin/licenses/create", key: "licenses" },
  { label: "Chuyên mục", icon: "solar:folder-bold-duotone", href: "/admin/categories", createHref: "/admin/categories/create", key: "categories" },
  { label: "Người dùng", icon: "solar:users-group-rounded-bold-duotone", href: "/admin/users", createHref: "", key: "users" },
];

export default function AdminDashboard() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [recent, setRecent] = useState<{ products: RecentItem[]; blog: RecentItem[]; licenses: RecentItem[] }>({
    products: [], blog: [], licenses: [],
  });

  useEffect(() => {
    (api.api.admin.dashboard as any).get().then(({ data }: any) => {
      if (data?.success) {
        setCounts(data.counts);
        setRecent(data.recent);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        </AppDashed>
      </div>
    );
  }

  const getCount = (key: string): { total: number; sub?: string } => {
    if (!counts) return { total: 0 };
    switch (key) {
      case "products": return { total: counts.products.total, sub: `${counts.products.published} công khai` };
      case "services": return { total: counts.services.total, sub: `${counts.services.published} công khai` };
      case "blog": return { total: counts.blog.total, sub: `${counts.blog.published} đã đăng` };
      case "projects": return { total: counts.projects.total, sub: `${counts.projects.published} công khai` };
      case "licenses": return { total: counts.licenses.total, sub: `${counts.licenses.active} active · ${counts.licenses.unused} unused` };
      case "categories": return { total: counts.categories };
      case "users": return { total: counts.users };
      default: return { total: 0 };
    }
  };

  const stats = counts ? [
    { label: "Sản phẩm", value: counts.products.total, icon: "solar:box-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
    { label: "Bài viết", value: counts.blog.total, icon: "solar:document-text-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
    { label: "License", value: counts.licenses.total, icon: "solar:key-bold-duotone", bgColor: "bg-orange-500/10", textColor: "text-orange-500" },
    { label: "Người dùng", value: counts.users, icon: "solar:users-group-rounded-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
  ] : [];

  return (
    <div className="flex flex-col w-full">
      {/* Header — same pattern as all admin pages */}
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:widget-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Dashboard</h1>
              <p className="text-xs text-muted-foreground">Tổng quan hệ thống</p>
            </div>
          </div>
        </div>
      </AppDashed>

      {/* Stats bar — same AdminStats component */}
      <AdminStats items={stats} />

      {/* Content list — flex table like AdminProducts */}
      <AppDashed noTopBorder padding="p-0">
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          <div className="w-[200px]">Mục</div>
          <div className="flex-1">Số lượng</div>
          <div className="w-[120px] text-right">Chi tiết</div>
          <div className="w-8 shrink-0" />
        </div>

        <div className="divide-y divide-border">
          {contentLinks.map((item) => {
            const c = getCount(item.key);
            return (
              <div
                key={item.key}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group whitespace-nowrap cursor-pointer"
                onClick={() => navigate(item.href)}
              >
                <div className="w-[200px] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon icon={item.icon} className="text-base text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </div>
                <div className="flex-1">
                  <span className="text-lg font-bold text-title tabular-nums">{c.total}</span>
                </div>
                <div className="w-[120px] text-right">
                  {c.sub ? (
                    <span className="text-[11px] text-muted-foreground">{c.sub}</span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  )}
                </div>
                <div className="w-8 shrink-0 flex justify-end">
                  <Icon icon="solar:arrow-right-bold" className="text-sm text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-border">
          <span className="text-[11px] text-muted-foreground">
            {contentLinks.length} mục quản lý
          </span>
        </div>
      </AppDashed>

      {/* Recent activity — 3-column flex panels */}
      <AppDashed noTopBorder padding="p-0">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Hoạt động gần đây</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Recent Products */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-medium text-muted-foreground">Sản phẩm mới</span>
              </div>
              <button onClick={() => navigate("/admin/products")} className="text-[10px] text-primary hover:underline cursor-pointer opacity-0 group-hover:opacity-100">
                Xem tất cả →
              </button>
            </div>
            <div className="divide-y divide-border">
              {recent.products.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">Chưa có</div>
              ) : (
                recent.products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className={`size-1.5 rounded-full ${statusColors[p.status] || "bg-zinc-400"} shrink-0`} />
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{timeAgo(p.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Blog */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-amber-500" />
                <span className="text-[11px] font-medium text-muted-foreground">Bài viết mới</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recent.blog.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">Chưa có</div>
              ) : (
                recent.blog.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => navigate(`/admin/blog/${b.id}/edit`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className={`size-1.5 rounded-full ${statusColors[b.status] || "bg-zinc-400"} shrink-0`} />
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{b.title}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{timeAgo(b.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Licenses */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-500" />
                <span className="text-[11px] font-medium text-muted-foreground">License mới</span>
              </div>
            </div>
            <div className="divide-y divide-border">
              {recent.licenses.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">Chưa có</div>
              ) : (
                recent.licenses.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => navigate(`/admin/licenses/${l.id}/edit`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className={`size-1.5 rounded-full ${statusColors[l.status] || "bg-zinc-400"} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground block truncate">{l.key}</span>
                      <span className="text-[10px] text-muted-foreground/70">{l.productName}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{timeAgo(l.createdAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </AppDashed>
    </div>
  );
}
