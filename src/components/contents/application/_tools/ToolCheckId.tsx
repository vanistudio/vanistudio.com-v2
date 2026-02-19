import { useState } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/use-page-title';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CheckResult {
  uid: string;
  name?: string;
  avatar?: string;
  cover?: string;
  link?: string;
}

export default function ToolCheckId() {
  usePageTitle("Check ID");
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState('');

  const extractId = async () => {
    if (!input.trim()) {
      toast.error('Vui lòng nhập link hoặc username');
      return;
    }
    setLoading(true);
    setResult(null);
    setError('');

    try {
      let target = input.trim();
      target = target.replace(/\/$/, '');
      if (target.includes('facebook.com')) {
        const match = target.match(/facebook\.com\/(?:profile\.php\?id=)?(\d+)|facebook\.com\/([^/?&]+)/);
        if (match) {
          target = match[1] || match[2] || target;
        }
      }

      const { data } = await (api.api.app.tools as any)['check-id'].get({ query: { target } });

      if (data?.success && data.uid) {
        setResult({
          uid: data.uid,
          name: data.name,
          avatar: data.avatar,
          cover: data.cover,
          link: `https://www.facebook.com/${data.uid}`,
        });
      } else {
        setError(data?.error || 'Không tìm thấy ID');
      }
    } catch {
      setError('Lỗi khi kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  const copyUid = () => {
    if (!result?.uid) return;
    navigator.clipboard.writeText(result.uid);
    toast.success('Đã sao chép UID');
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-blue-500/10 mb-1">
            <Icon icon="solar:user-id-bold-duotone" className="text-3xl text-blue-500" />
          </div>
          <h1 className="text-xl font-bold text-title">Check ID</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Lấy UID Facebook từ link profile hoặc username
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-5">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-title">Link hoặc Username</label>
            <div className="flex gap-2">
              <Input
                placeholder="facebook.com/username hoặc ID..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && extractId()}
              />
              <Button onClick={extractId} disabled={loading || !input.trim()}>
                {loading ? (
                  <Icon icon="solar:spinner-bold-duotone" className="text-base animate-spin" />
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
            <div className="flex flex-col rounded-xl border border-border bg-muted/20 overflow-hidden">
              {result.cover && (
                <div className="w-full h-32 bg-muted overflow-hidden">
                  <img src={result.cover} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  {result.avatar ? (
                    <img src={result.avatar} alt="Avatar" className="size-14 rounded-full border-2 border-background shadow-sm shrink-0 object-cover" />
                  ) : (
                    <div className="size-14 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Icon icon="solar:user-bold-duotone" className="text-2xl text-blue-500" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    {result.name && <span className="text-sm font-medium text-title truncate">{result.name}</span>}
                    <span className="text-xs text-muted-foreground">Facebook UID</span>
                  </div>
                </div>
                <button
                  onClick={copyUid}
                  className="flex items-center justify-between px-4 py-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  <span className="text-lg font-bold font-mono text-title">{result.uid}</span>
                  <Icon icon="solar:copy-bold-duotone" className="text-lg text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
                {result.link && (
                  <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Icon icon="solar:link-bold-duotone" className="text-base" />
                    Mở profile
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </AppDashed>
    </div>
  );
}
