import { useState, useEffect } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
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
  published: "bg-emerald-500",
  draft: "bg-zinc-400",
  archived: "bg-amber-500",
  active: "bg-emerald-500",
  unused: "bg-zinc-400",
  revoked: "bg-red-500",
  expired: "bg-amber-500",
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

  const statCards = counts ? [
    { label: "Người dùng", value: counts.users, icon: "solar:users-group-rounded-bold-duotone", href: "/admin/users", bg: "bg-blue-500/10", text: "text-blue-500" },
    { label: "Chuyên mục", value: counts.categories, icon: "solar:folder-bold-duotone", href: "/admin/categories", bg: "bg-violet-500/10", text: "text-violet-500" },
    { label: "Sản phẩm", value: counts.products.total, sub: `${counts.products.published} công khai`, icon: "solar:box-bold-duotone", href: "/admin/products", bg: "bg-emerald-500/10", text: "text-emerald-500" },
    { label: "Dịch vụ", value: counts.services.total, sub: `${counts.services.published} công khai`, icon: "solar:widget-5-bold-duotone", href: "/admin/services", bg: "bg-cyan-500/10", text: "text-cyan-500" },
    { label: "Bài viết", value: counts.blog.total, sub: `${counts.blog.published} đã đăng`, icon: "solar:document-text-bold-duotone", href: "/admin/blog", bg: "bg-amber-500/10", text: "text-amber-500" },
    { label: "Dự án", value: counts.projects.total, sub: `${counts.projects.published} công khai`, icon: "solar:code-bold-duotone", href: "/admin/projects", bg: "bg-pink-500/10", text: "text-pink-500" },
    { label: "License", value: counts.licenses.total, sub: `${counts.licenses.active} đang dùng · ${counts.licenses.unused} chưa dùng`, icon: "solar:key-bold-duotone", href: "/admin/licenses", bg: "bg-orange-500/10", text: "text-orange-500" },
  ] : [];

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon icon="solar:widget-bold-duotone" className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-title">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Tổng quan hệ thống VaniStudio</p>
          </div>
        </div>
      </AppDashed>

      {/* Stats Grid */}
      <AppDashed noTopBorder padding="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.href)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                <Icon icon={card.icon} className={`text-xl ${card.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-2xl font-bold text-title tabular-nums">{card.value}</span>
                <span className="text-xs text-muted-foreground block">{card.label}</span>
                {card.sub && <span className="text-[10px] text-muted-foreground/70 block">{card.sub}</span>}
              </div>
              <Icon icon="solar:arrow-right-bold" className="text-sm text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </AppDashed>

      {/* Recent Activity */}
      <AppDashed noTopBorder padding="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recent Products */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon icon="solar:box-bold-duotone" className="text-sm text-emerald-500" />
                <span className="text-xs font-semibold text-title">Sản phẩm mới</span>
              </div>
              <button onClick={() => navigate("/admin/products")} className="text-[10px] text-primary hover:underline cursor-pointer">
                Xem tất cả
              </button>
            </div>
            <div className="divide-y divide-border">
              {recent.products.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">Chưa có sản phẩm</div>
              ) : (
                recent.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer w-full text-left"
                  >
                    <div className={`size-1.5 rounded-full ${statusColors[p.status] || "bg-zinc-400"} shrink-0`} />
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(p.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent Blog */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon icon="solar:document-text-bold-duotone" className="text-sm text-amber-500" />
                <span className="text-xs font-semibold text-title">Bài viết mới</span>
              </div>
              <button onClick={() => navigate("/admin/blog")} className="text-[10px] text-primary hover:underline cursor-pointer">
                Xem tất cả
              </button>
            </div>
            <div className="divide-y divide-border">
              {recent.blog.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">Chưa có bài viết</div>
              ) : (
                recent.blog.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => navigate(`/admin/blog/${b.id}/edit`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer w-full text-left"
                  >
                    <div className={`size-1.5 rounded-full ${statusColors[b.status] || "bg-zinc-400"} shrink-0`} />
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{b.title}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(b.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Recent Licenses */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Icon icon="solar:key-bold-duotone" className="text-sm text-orange-500" />
                <span className="text-xs font-semibold text-title">License mới</span>
              </div>
              <button onClick={() => navigate("/admin/licenses")} className="text-[10px] text-primary hover:underline cursor-pointer">
                Xem tất cả
              </button>
            </div>
            <div className="divide-y divide-border">
              {recent.licenses.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">Chưa có license</div>
              ) : (
                recent.licenses.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/admin/licenses/${l.id}/edit`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer w-full text-left"
                  >
                    <div className={`size-1.5 rounded-full ${statusColors[l.status] || "bg-zinc-400"} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono text-muted-foreground block truncate">{l.key}</span>
                      <span className="text-[10px] text-muted-foreground/70">{l.productName}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(l.createdAt)}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </AppDashed>

      {/* Quick Actions */}
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="solar:bolt-bold-duotone" className="text-sm text-primary" />
          <span className="text-xs font-semibold text-title">Thao tác nhanh</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Thêm sản phẩm", icon: "solar:box-bold-duotone", href: "/admin/products/create", color: "text-emerald-500" },
            { label: "Viết blog", icon: "solar:document-text-bold-duotone", href: "/admin/blog/create", color: "text-amber-500" },
            { label: "Tạo license", icon: "solar:key-bold-duotone", href: "/admin/licenses/create", color: "text-orange-500" },
            { label: "Thêm dịch vụ", icon: "solar:widget-5-bold-duotone", href: "/admin/services/create", color: "text-cyan-500" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.href)}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer text-left"
            >
              <Icon icon={action.icon} className={`text-base ${action.color}`} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </AppDashed>
    </div>
  );
}
