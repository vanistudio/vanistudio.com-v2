import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/use-page-title';
import { toast } from 'sonner';

function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = encoded.replace(/[\s=-]/g, '').toUpperCase();
  let bits = '';
  for (const c of cleaned) {
    const val = alphabet.indexOf(c);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

async function generateTOTP(secret: string): Promise<string> {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / 30);
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, time, false);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
  const hmac = new Uint8Array(signature);

  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, '0');
}

export default function Tool2FA() {
  usePageTitle("Lấy mã 2FA");
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async () => {
    if (!secret.trim()) return;
    try {
      const otp = await generateTOTP(secret.trim());
      setCode(otp);
    } catch {
      setCode('');
      toast.error('Secret key không hợp lệ');
    }
  }, [secret]);

  useEffect(() => {
    if (!secret.trim()) return;
    generate();
    const interval = setInterval(() => {
      const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTimeLeft(remaining);
      if (remaining === 30) generate();
    }, 500);
    return () => clearInterval(interval);
  }, [secret, generate]);

  const handleGenerate = async () => {
    if (!secret.trim()) {
      toast.error('Vui lòng nhập secret key');
      return;
    }
    setGenerating(true);
    await generate();
    setGenerating(false);
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success('Đã sao chép mã OTP');
  };

  const progress = ((30 - timeLeft) / 30) * 100;

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="p-3 rounded-xl bg-primary/10 mb-1">
            <Icon icon="solar:lock-password-bold-duotone" className="text-3xl text-primary" />
          </div>
          <h1 className="text-xl font-bold text-title">Lấy mã 2FA</h1>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Tạo mã xác thực 2 bước (TOTP) từ secret key
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-5">
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-title">Secret Key</label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập secret key (Base32)..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="font-mono text-sm"
              />
              <Button onClick={handleGenerate} disabled={generating || !secret.trim()}>
                <Icon icon="solar:refresh-bold" className="text-base mr-1" />
                Tạo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ví dụ: JBSWY3DPEHPK3PXP
            </p>
          </div>

          {code && (
            <div className="flex flex-col items-center gap-4 p-6 rounded-xl border border-border bg-muted/20">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mã OTP</div>
              <button
                onClick={copyCode}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-background border border-border hover:border-primary/50 transition-colors group cursor-pointer"
              >
                <span className="text-4xl font-bold tracking-[0.3em] text-title font-mono">
                  {code.slice(0, 3)} {code.slice(3)}
                </span>
                <Icon icon="solar:copy-bold-duotone" className="text-xl text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <div className="w-full flex flex-col items-center gap-2">
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-linear"
                    style={{
                      width: `${100 - progress}%`,
                      backgroundColor: timeLeft <= 5 ? 'var(--destructive)' : timeLeft <= 10 ? '#f59e0b' : 'var(--primary)',
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Hết hạn sau <span className={timeLeft <= 5 ? 'text-destructive font-bold' : 'font-medium'}>{timeLeft}s</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </AppDashed>
    </div>
  );
}
