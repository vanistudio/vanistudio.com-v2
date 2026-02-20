import { useState } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/hooks/use-page-title';
import { api } from '@/lib/api';

interface VerifyResult {
  productName: string;
  status: string;
  domain: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  active: { label: "Đã xác minh", color: "text-emerald-500", bg: "border-emerald-500/30 bg-emerald-500/5", icon: "solar:verified-check-bold" },
  expired: { label: "Hết hạn", color: "text-amber-500", bg: "border-amber-500/30 bg-amber-500/5", icon: "solar:clock-circle-bold-duotone" },
  revoked: { label: "Đã thu hồi", color: "text-destructive", bg: "border-destructive/30 bg-destructive/5", icon: "solar:close-circle-bold-duotone" },
  unused: { label: "Chưa kích hoạt", color: "text-muted-foreground", bg: "border-border bg-muted/10", icon: "solar:minus-circle-bold-duotone" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AppLicense() {
  usePageTitle("Xác minh giấy phép");
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = domain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/+$/, "");
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    setVerified(null);
    try {
      const { data } = await (api.api.app.license as any)['verify-domain'][trimmed].get() as any;
      if (data?.success) {
        setVerified(data.verified);
        setResult(data.license);
      } else {
        setError(data?.error || "Không tìm thấy giấy phép");
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
            <Icon icon="solar:shield-check-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Xác minh giấy phép</h1>
          <p className="text-sm text-muted-foreground text-center max-w-lg">
            Nhập tên miền website để kiểm tra giấy phép hoạt động được cấp bởi Vani Studio
          </p>
        </div>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        <form onSubmit={handleCheck} className="flex items-center justify-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Icon icon="solar:global-bold-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              className="text-sm h-9 pl-9"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading || !domain.trim()} size="sm" className="h-9 shrink-0 px-4">
            {loading ? (
              <Icon icon="svg-spinners:ring-resize" className="text-sm" />
            ) : (
              <>
                <Icon icon="solar:shield-check-bold-duotone" className="text-sm mr-1.5" />
                Xác minh
              </>
            )}
          </Button>
        </form>
      </AppDashed>
      <AppDashed noTopBorder padding="p-5">
        {error && (
          <div className="flex flex-col items-center gap-3 max-w-md mx-auto py-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <Icon icon="solar:shield-warning-bold-duotone" className="text-4xl text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-destructive mb-1">Không tìm thấy giấy phép</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        )}
        {result && statusInfo && (
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <div className={cn("flex flex-col items-center gap-3 p-6 rounded-xl border", statusInfo.bg)}>
              <div className="relative">
                <Icon icon={statusInfo.icon} className={cn("text-5xl", statusInfo.color)} />
                {verified && (
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-background">
                    <Icon icon="solar:check-circle-bold" className="text-lg text-emerald-500" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className={cn("text-base font-bold", statusInfo.color)}>{statusInfo.label}</p>
                {verified ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    Website này đã được <span className="text-foreground font-medium">Vani Studio</span> cấp giấy phép hoạt động hợp lệ
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Giấy phép cho website này hiện {result.status === "expired" ? "đã hết hạn" : result.status === "revoked" ? "đã bị thu hồi" : "chưa được kích hoạt"}
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              {[
                { icon: "solar:global-bold-duotone", label: "Tên miền", value: result.domain || "—" },
                { icon: "solar:box-bold-duotone", label: "Sản phẩm", value: result.productName },
                { icon: "solar:calendar-bold-duotone", label: "Ngày cấp phép", value: formatDate(result.activatedAt || result.createdAt) },
                { icon: "solar:calendar-mark-bold-duotone", label: "Hiệu lực đến", value: result.expiresAt ? formatDate(result.expiresAt) : "Vĩnh viễn" },
              ].map((item, i) => (
                <div key={item.label} className={cn("flex items-center gap-3 px-4 py-3", i < 3 && "border-b border-border")}>
                  <Icon icon={item.icon} className="text-lg text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-title truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Kết quả xác minh bởi hệ thống Vani Studio License Server
            </p>
          </div>
        )}
        {!error && !result && !loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Icon icon="solar:shield-check-bold-duotone" className="text-4xl text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Nhập tên miền để xác minh giấy phép</p>
          </div>
        )}
      </AppDashed>
    </div>
  );
}
