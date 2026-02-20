import { useState, useEffect, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AdminStats from "@/components/vani/AdminStats";
import { DataTable } from "@/components/vani/datatable/DataTable";
import { usePageTitle } from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface RequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  ip: string;
  userAgent: string;
  duration: number;
  timestamp: number;
}

interface Stats {
  total: number;
  last5m: number;
  last1h: number;
  avgDuration: number;
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-600",
  POST: "bg-blue-500/10 text-blue-600",
  PATCH: "bg-amber-500/10 text-amber-600",
  PUT: "bg-orange-500/10 text-orange-600",
  DELETE: "bg-red-500/10 text-red-600",
};

function statusColor(s: number) {
  if (s < 300) return "text-emerald-500";
  if (s < 400) return "text-amber-500";
  return "text-destructive";
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "vừa xong";
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h`;
}

const INTERNAL_PREFIXES = ["/api/admin", "/api/auth", "/api/config"];
function isInternal(path: string): boolean {
  return INTERNAL_PREFIXES.some((p) => path.startsWith(p));
}

const columns: ColumnDef<RequestLog, any>[] = [
  {
    accessorKey: "method",
    header: "Method",
    size: 80,
    cell: ({ row }) => (
      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", methodColors[row.original.method] || "bg-muted text-foreground")}>
        {row.original.method}
      </span>
    ),
  },
  {
    accessorKey: "path",
    header: "Path",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-mono text-foreground truncate max-w-[350px] block">{row.original.path}</span>
        {isInternal(row.original.path) ? (
          <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-500 shrink-0">nội bộ</span>
        ) : (
          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-500 shrink-0">public</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 60,
    cell: ({ row }) => (
      <span className={cn("font-bold tabular-nums", statusColor(row.original.status))}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Thời gian",
    size: 80,
    cell: ({ row }) => (
      <span className={cn("tabular-nums", row.original.duration > 500 ? "text-destructive" : row.original.duration > 200 ? "text-amber-500" : "text-muted-foreground")}>
        {row.original.duration}ms
      </span>
    ),
  },
  {
    accessorKey: "ip",
    header: "IP",
    size: 130,
    cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.ip}</span>,
  },
  {
    id: "time",
    header: "Lúc",
    size: 70,
    cell: ({ row }) => <span className="text-muted-foreground">{timeAgo(row.original.timestamp)}</span>,
  },
];

export default function AdminRequests() {
  usePageTitle("Request Logs");
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const activeFilterCount = [sourceFilter, methodFilter, statusFilter].filter((f) => f !== "all").length;

  const clearFilters = () => {
    setSourceFilter("all");
    setMethodFilter("all");
    setStatusFilter("all");
  };

  const fetchData = useCallback(async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        (api.api.admin.requests as any).get({ query: { limit: "500" } }),
        (api.api.admin.requests as any).stats.get(),
      ]);
      if (logsRes.data?.success) setLogs(logsRes.data.logs);
      if (statsRes.data?.success) setStats(statsRes.data.stats);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (search && !l.path.toLowerCase().includes(search.toLowerCase()) && !l.ip.includes(search)) return false;
      if (sourceFilter === "internal" && !isInternal(l.path)) return false;
      if (sourceFilter === "external" && isInternal(l.path)) return false;
      if (methodFilter !== "all" && l.method !== methodFilter) return false;
      if (statusFilter === "2xx" && (l.status < 200 || l.status >= 300)) return false;
      if (statusFilter === "3xx" && (l.status < 300 || l.status >= 400)) return false;
      if (statusFilter === "4xx" && (l.status < 400 || l.status >= 500)) return false;
      if (statusFilter === "5xx" && l.status < 500) return false;
      return true;
    });
  }, [logs, search, sourceFilter, methodFilter, statusFilter]);

  const handleClear = async () => {
    await (api.api.admin.requests as any).clear.delete();
    setLogs([]);
    fetchData();
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon icon="solar:chart-2-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-title">Request Logs</h1>
              <p className="text-xs text-muted-foreground">{logs.length} request</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Icon icon={autoRefresh ? "solar:refresh-bold-duotone" : "solar:pause-bold-duotone"} className="text-sm mr-1.5" />
              {autoRefresh ? "Live" : "Paused"}
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={fetchData}>
              <Icon icon="solar:refresh-bold-duotone" className="text-sm" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-8 text-destructive" onClick={handleClear}>
              <Icon icon="solar:trash-bin-minimalistic-bold-duotone" className="text-sm" />
            </Button>
          </div>
        </div>
      </AppDashed>
      {stats && (
        <AdminStats
          items={[
            { label: "Tổng", value: stats.total, icon: "solar:chart-2-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
            { label: "5 phút gần", value: stats.last5m, icon: "solar:clock-circle-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
            { label: "1 giờ gần", value: stats.last1h, icon: "solar:history-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
            { label: "Avg", value: `${stats.avgDuration}ms`, icon: "solar:stopwatch-bold-duotone", bgColor: "bg-purple-500/10", textColor: "text-purple-500" },
          ]}
        />
      )}
      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm theo path hoặc IP..."
              className="pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  <span className="text-xs font-semibold text-foreground">Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-[11px] text-primary hover:underline cursor-pointer">
                      Xóa tất cả
                    </button>
                  )}
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Nguồn</span>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="internal">Nội bộ</SelectItem>
                      <SelectItem value="external">Bên ngoài</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Method</span>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="2xx">2xx Thành công</SelectItem>
                      <SelectItem value="3xx">3xx Redirect</SelectItem>
                      <SelectItem value="4xx">4xx Lỗi client</SelectItem>
                      <SelectItem value="5xx">5xx Lỗi server</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-0">
        <DataTable
          columns={columns}
          data={filtered}
          showToolbar={false}
          compact
          defaultPageSize={50}
          pageSizeOptions={[25, 50, 100, 200]}
          emptyIcon="solar:chart-2-bold-duotone"
          emptyMessage="Chưa có request nào"
        />
      </AppDashed>
    </div>
  );
}
