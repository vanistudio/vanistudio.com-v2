import { useState, useEffect, useMemo } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface TableInfo {
  name: string;
  rows: number;
  size: string;
  sizeBytes: number;
  totalSize: string;
  totalSizeBytes: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminDatabase() {
  usePageTitle("Database");

  const [tables, setTables] = useState<TableInfo[]>([]);
  const [databaseSize, setDatabaseSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data } = await (api.api.admin.database as any).tables.get();
      if (data?.success) {
        setTables(data.tables || []);
        setDatabaseSize(data.databaseSize || "");
      }
    } catch {
      toast.error("Không thể tải thông tin database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const filteredTables = useMemo(() => {
    if (!search) return tables;
    const q = search.toLowerCase();
    return tables.filter((t) => t.name.toLowerCase().includes(q));
  }, [tables, search]);

  const stats = useMemo(() => {
    const totalTables = tables.length;
    const totalRows = tables.reduce((sum, t) => sum + t.rows, 0);
    const totalBytes = tables.reduce((sum, t) => sum + t.totalSizeBytes, 0);
    return [
      { label: "Tổng bảng", value: totalTables, icon: "solar:database-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Tổng hàng", value: totalRows.toLocaleString(), icon: "solar:layers-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Dung lượng bảng", value: formatBytes(totalBytes), icon: "solar:server-bold-duotone", bgColor: "bg-violet-500/10", textColor: "text-violet-500" },
      { label: "Database", value: databaseSize || "—", icon: "solar:cloud-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
    ];
  }, [tables, databaseSize]);

  const maxBytes = useMemo(() => Math.max(...tables.map((t) => t.totalSizeBytes), 1), [tables]);

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:database-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Database</h1>
              <p className="text-xs text-muted-foreground">{tables.length} bảng • {databaseSize}</p>
            </div>
          </div>
          <button
            onClick={fetchTables}
            disabled={loading}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Icon icon="solar:refresh-bold-duotone" className={`text-base ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </AppDashed>
      <AdminStats items={stats} />
      <AppDashed noTopBorder padding="p-3">
        <div className="relative">
          <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <Input
            placeholder="Tìm bảng..."
            className="pl-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:database-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? "Không tìm thấy bảng phù hợp" : "Không có bảng nào"}
            </p>
          </div>
        ) : (
          <div className="min-w-[540px]">
            <div className="grid grid-cols-[1fr_100px_120px_120px] gap-2 px-4 py-2 border-b border-border">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Tên bảng</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Số hàng</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Dữ liệu</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Tổng</span>
            </div>
            <div className="divide-y divide-border">
              {filteredTables.map((table) => (
                <div key={table.name} className="grid grid-cols-[1fr_100px_120px_120px] items-center gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Icon icon="solar:database-bold-duotone" className="text-sm text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-foreground font-mono">{table.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Badge variant="secondary" className="text-[11px] px-2 py-0 font-mono">
                      {table.rows.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-mono">{table.size}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-foreground font-mono font-medium">{table.totalSize}</span>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className="bg-primary/40 h-1 rounded-full transition-all"
                        style={{ width: `${Math.max((table.totalSizeBytes / maxBytes) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredTables.length} / {tables.length} bảng
              </span>
            </div>
          </div>
        )}
      </AppDashed>
    </div>
  );
}
