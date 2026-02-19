import { useState } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePageTitle } from '@/hooks/use-page-title';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface DomainResult {
  domain: string;
  available: boolean;
  dns?: {
    A?: string[];
    AAAA?: string[];
    MX?: { exchange: string; priority: number }[];
    NS?: string[];
    TXT?: string[];
    CNAME?: string[];
  };
  ssl?: {
    issuer?: string;
    validFrom?: string;
    validTo?: string;
    daysLeft?: number;
  };
  server?: string;
  statusCode?: number;
}

function InfoBlock({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium text-title">
        <Icon icon={icon} className="text-base text-primary" />
        {label}
      </div>
      {children}
    </div>
  );
}

function DnsRow({ type, records }: { type: string; records: string[] }) {
  if (!records?.length) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Badge variant="outline" className="text-[10px] font-mono shrink-0 mt-0.5">{type}</Badge>
      <div className="flex flex-wrap gap-1">
        {records.map((r, i) => (
          <span key={i} className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{r}</span>
        ))}
      </div>
    </div>
  );
}

export default function ToolCheckDomain() {
  usePageTitle("Kiểm tra Domain");
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainResult | null>(null);
  const [error, setError] = useState('');

  const checkDomain = async () => {
    let cleaned = domain.trim().toLowerCase();
    if (!cleaned) {
      toast.error('Vui lòng nhập domain');
      return;
    }
    cleaned = cleaned.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(cleaned)) {
      toast.error('Domain không hợp lệ');
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const { data } = await (api.api.app.tools as any)['check-domain'].get({ query: { domain: cleaned } });

      if (data?.success) {
        setResult(data.result);
      } else {
        setError(data?.error || 'Lỗi khi kiểm tra');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:planet-3-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Kiểm tra Domain</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Tra cứu DNS, SSL và trạng thái của một tên miền
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-5">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-title">Tên miền</label>
            <div className="flex gap-2">
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkDomain()}
                className="font-mono text-sm"
              />
              <Button onClick={checkDomain} disabled={loading || !domain.trim()}>
                {loading ? (
                  <Icon icon="svg-spinners:ring-resize" className="text-base animate-spin" />
                ) : (
                  <Icon icon="solar:magnifer-bold-duotone" className="text-base" />
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

          {result && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
                <div className={cn("size-3 rounded-full shrink-0", result.available ? "bg-destructive" : "bg-emerald-500")} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold font-mono text-title">{result.domain}</span>
                  <span className="text-xs text-muted-foreground">
                    {result.available ? "Domain chưa được đăng ký" : "Domain đang hoạt động"}
                  </span>
                </div>
                {result.statusCode && (
                  <Badge variant="outline" className="ml-auto text-xs font-mono">HTTP {result.statusCode}</Badge>
                )}
              </div>
              {result.server && (
                <div className="p-4 rounded-xl border border-border">
                  <InfoBlock label="Web Server" icon="solar:server-bold-duotone">
                    <span className="text-sm font-mono text-muted-foreground">{result.server}</span>
                  </InfoBlock>
                </div>
              )}
              {result.ssl && (
                <div className="p-4 rounded-xl border border-border">
                  <InfoBlock label="Chứng chỉ SSL" icon="solar:shield-check-bold-duotone">
                    <div className="flex flex-col gap-1.5">
                      {result.ssl.issuer && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Issuer</span>
                          <span className="font-mono text-title">{result.ssl.issuer}</span>
                        </div>
                      )}
                      {result.ssl.validFrom && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Từ</span>
                          <span className="font-mono text-title">{new Date(result.ssl.validFrom).toLocaleDateString("vi-VN")}</span>
                        </div>
                      )}
                      {result.ssl.validTo && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Đến</span>
                          <span className="font-mono text-title">{new Date(result.ssl.validTo).toLocaleDateString("vi-VN")}</span>
                        </div>
                      )}
                      {result.ssl.daysLeft != null && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Còn lại</span>
                          <span className={cn("font-mono font-medium", result.ssl.daysLeft < 30 ? "text-destructive" : "text-emerald-500")}>
                            {result.ssl.daysLeft} ngày
                          </span>
                        </div>
                      )}
                    </div>
                  </InfoBlock>
                </div>
              )}
              {result.dns && (
                <div className="p-4 rounded-xl border border-border">
                  <InfoBlock label="DNS Records" icon="solar:database-bold-duotone">
                    <div className="flex flex-col divide-y divide-border/50">
                      <DnsRow type="A" records={result.dns.A || []} />
                      <DnsRow type="AAAA" records={result.dns.AAAA || []} />
                      <DnsRow type="CNAME" records={result.dns.CNAME || []} />
                      <DnsRow type="NS" records={result.dns.NS || []} />
                      <DnsRow type="MX" records={(result.dns.MX || []).map(m => `${m.priority} ${m.exchange}`)} />
                      <DnsRow type="TXT" records={result.dns.TXT || []} />
                    </div>
                  </InfoBlock>
                </div>
              )}
            </div>
          )}
        </div>
      </AppDashed>
    </div>
  );
}
