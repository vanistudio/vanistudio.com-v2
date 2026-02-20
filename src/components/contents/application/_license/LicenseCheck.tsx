import { useState } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface LicenseResult {
  id: string;
  key: string;
  productName: string;
  status: string;
  maxActivations: number;
  currentActivations: number;
  domain: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string; icon: string }> = {
  active: { label: "Đang hoạt động", color: "text-emerald-500", icon: "solar:check-circle-bold-duotone" },
  expired: { label: "Hết hạn", color: "text-destructive", icon: "solar:clock-circle-bold-duotone" },
  revoked: { label: "Đã thu hồi", color: "text-destructive", icon: "solar:close-circle-bold-duotone" },
  unused: { label: "Chưa kích hoạt", color: "text-amber-500", icon: "solar:minus-circle-bold-duotone" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function LicenseCheck() {
  usePageTitle("Kiểm tra License");
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LicenseResult | null>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await (api.api.app.license.check as any)[trimmed].get() as any;
      if (data?.success) {
        setResult(data.license);
      } else {
        setError(data?.error || "Không tìm thấy license");
      }
    } catch {
      setError("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = result ? statusMap[result.status] || statusMap.unused : null;

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:key-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Kiểm tra License</h1>
          <p className="text-sm text-muted-foreground text-center max-w-lg">
            Nhập license key để kiểm tra trạng thái kích hoạt
          </p>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        <form onSubmit={handleCheck} className="flex items-center justify-center gap-2 max-w-md mx-auto">
          <Input
            className="text-sm font-mono h-9"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <Button type="submit" disabled={loading || !key.trim()} size="sm" className="h-9 shrink-0">
            {loading ? (
              <Icon icon="svg-spinners:ring-resize" className="text-sm" />
            ) : (
              <Icon icon="solar:magnifer-bold-duotone" className="text-sm" />
            )}
          </Button>
        </form>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm max-w-md mx-auto">
            <Icon icon="solar:danger-circle-bold-duotone" className="text-lg shrink-0" />
            {error}
          </div>
        )}
        {result && statusInfo && (
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/10">
              <Icon icon={statusInfo.icon} className={cn("text-3xl", statusInfo.color)} />
              <div>
                <p className={cn("text-sm font-bold", statusInfo.color)}>{statusInfo.label}</p>
                <p className="text-xs text-muted-foreground">{result.productName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "License Key", value: result.key, mono: true, full: true },
                { label: "Kích hoạt", value: `${result.currentActivations}/${result.maxActivations}` },
                { label: "Domain", value: result.domain || "Không giới hạn" },
                { label: "Ngày kích hoạt", value: formatDate(result.activatedAt) },
                { label: "Ngày hết hạn", value: formatDate(result.expiresAt) },
                { label: "Ngày tạo", value: formatDate(result.createdAt) },
              ].map((item: any) => (
                <div key={item.label} className={cn("p-3 rounded-lg border border-border bg-background", item.full && "col-span-2")}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className={cn("text-sm font-medium text-title truncate", item.mono && "font-mono text-xs")}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!error && !result && !loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Icon icon="solar:key-bold-duotone" className="text-4xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Nhập license key để bắt đầu kiểm tra</p>
          </div>
        )}
      </AppDashed>
    </div>
  );
}
