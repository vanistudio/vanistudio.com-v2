import { useState } from 'react';
import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '@/hooks/use-page-title';
import { useAuth } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AuthLogin() {
  usePageTitle("Đăng nhập");
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }
    setLoading(true);
    try {
      const { data } = await (api.api.auth as any).login.post(form) as any;
      if (data?.success) {
        await refresh();
        toast.success("Đăng nhập thành công!");
        navigate(data.needsOnboarding ? "/onboarding" : "/");
      } else {
        toast.error(data?.error || "Đăng nhập thất bại");
      }
    } catch {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-6">
        <div className="flex flex-col gap-4 max-w-[380px] mx-auto w-full">
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold text-title">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground mt-1">Chào mừng bạn trở lại</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mật khẩu</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? (
                <Icon icon="svg-spinners:ring-resize" className="text-sm mr-2" />
              ) : (
                <Icon icon="solar:login-bold-duotone" className="text-sm mr-2" />
              )}
              Đăng nhập
            </Button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-xs text-muted-foreground">hoặc</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <a
              href="/api/auth/github"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
            >
              <Icon icon="mdi:github" className="text-xl" />
              <span>Đăng nhập với GitHub</span>
            </a>
            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
            >
              <Icon icon="flat-color-icons:google" className="text-xl" />
              <span>Đăng nhập với Google</span>
            </a>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-2">
            Chưa có tài khoản?{" "}
            <Link to="/auth/register" className="text-primary font-medium hover:underline">Đăng ký</Link>
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <p className="text-xs text-muted-foreground text-center">
          Bằng việc đăng nhập, bạn đồng ý với{" "}
          <Link to="/terms" className="text-primary hover:underline">Điều khoản Dịch vụ</Link>
          {" "}và{" "}
          <Link to="/privacy" className="text-primary hover:underline">Chính sách Bảo mật</Link>
          {" "}của chúng tôi.
        </p>
      </AppDashed>
    </div>
  );
}