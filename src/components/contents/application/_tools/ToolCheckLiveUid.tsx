import { useState } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/use-page-title';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface CheckResult {
  uid: string;
  isLive: boolean;
  name?: string;
}

export default function ToolCheckLiveUid() {
  usePageTitle("Check Live UID");
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [error, setError] = useState('');

  const checkUids = async () => {
    const raw = input.trim();
    if (!raw) {
      toast.error('Vui lòng nhập UID');
      return;
    }

    // Support multiple UIDs separated by newlines, commas, or spaces
    const uids = raw.split(/[\n,\s]+/).map(s => s.trim()).filter(s => /^\d+$/.test(s));
    if (uids.length === 0) {
      toast.error('Không tìm thấy UID hợp lệ (chỉ chấp nhận số)');
      return;
    }

    setLoading(true);
    setResults([]);
    setError('');

    try {
      const { data } = await (api.api.app.tools as any)['check-live-uid'].post({ uids: uids.slice(0, 50) });

      if (data?.success) {
        setResults(data.results || []);
        const live = (data.results || []).filter((r: CheckResult) => r.isLive).length;
        toast.success(`${live}/${uids.length} UID đang hoạt động`);
      } else {
        setError(data?.error || 'Lỗi khi kiểm tra');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const liveCount = results.filter(r => r.isLive).length;
  const deadCount = results.filter(r => !r.isLive).length;

  const copyLive = () => {
    const live = results.filter(r => r.isLive).map(r => r.uid).join('\n');
    if (!live) return;
    navigator.clipboard.writeText(live);
    toast.success(`Đã sao chép ${liveCount} UID live`);
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:user-check-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Check Live UID</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Kiểm tra tài khoản Facebook còn hoạt động hay đã bị vô hiệu hóa
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-5">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-title">Nhập UID (tối đa 50)</label>
            <textarea
              placeholder={"Mỗi UID một dòng hoặc phân cách bằng dấu phẩy...\n\nVí dụ:\n100001234567890\n100009876543210"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {input.split(/[\n,\s]+/).filter(s => /^\d+$/.test(s.trim())).length} UID hợp lệ
              </p>
              <Button onClick={checkUids} disabled={loading || !input.trim()} size="sm">
                {loading ? (
                  <>
                    <Icon icon="svg-spinners:ring-resize" className="text-base animate-spin mr-1.5" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:check-read-bold-duotone" className="text-base mr-1.5" />
                    Kiểm tra
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
              <Icon icon="solar:danger-triangle-bold-duotone" className="text-lg shrink-0" />
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="flex flex-col gap-3">
              {/* Stats */}
              <div className="flex gap-2">
                <div className="flex-1 p-3 rounded-lg border border-border text-center">
                  <p className="text-lg font-bold text-title">{results.length}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tổng</p>
                </div>
                <div className="flex-1 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-center">
                  <p className="text-lg font-bold text-emerald-500">{liveCount}</p>
                  <p className="text-[10px] text-emerald-500/70 uppercase tracking-wider">Live</p>
                </div>
                <div className="flex-1 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-center">
                  <p className="text-lg font-bold text-destructive">{deadCount}</p>
                  <p className="text-[10px] text-destructive/70 uppercase tracking-wider">Die</p>
                </div>
              </div>

              {liveCount > 0 && (
                <Button variant="outline" size="sm" onClick={copyLive} className="w-full">
                  <Icon icon="solar:copy-bold-duotone" className="text-base mr-1.5" />
                  Sao chép {liveCount} UID live
                </Button>
              )}

              {/* Results list */}
              <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
                {results.map((r) => (
                  <div key={r.uid} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("size-2 rounded-full shrink-0", r.isLive ? "bg-emerald-500" : "bg-destructive")} />
                      <span className="text-sm font-mono text-title truncate">{r.uid}</span>
                      {r.name && <span className="text-xs text-muted-foreground truncate hidden sm:inline">({r.name})</span>}
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", r.isLive ? "text-emerald-500 bg-emerald-500/10" : "text-destructive bg-destructive/10")}>
                      {r.isLive ? "Live" : "Die"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AppDashed>
    </div>
  );
}
