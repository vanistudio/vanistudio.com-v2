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

export default function AuthRegister() {
  usePageTitle("Đăng ký");
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.email || !form.password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (form.username.length < 3) {
      toast.error("Username tối thiểu 3 ký tự");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const { data } = await (api.api.auth as any).register.post(form) as any;
      if (data?.success) {
        await refresh();
        toast.success("Đăng ký thành công!");
        navigate("/");
      } else {
        toast.error(data?.error || "Đăng ký thất bại");
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
        <div className="flex flex-col gap-4 max-w-[420px] mx-auto w-full">
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold text-title">Đăng ký tài khoản</h1>
            <p className="text-sm text-muted-foreground mt-1">Tạo tài khoản mới để sử dụng dịch vụ</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Họ tên *</label>
              <Input
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Username *</label>
              <Input
                placeholder="nguyenvana"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email *</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Số điện thoại / Zalo</label>
              <Input
                placeholder="0912 345 678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mật khẩu *</label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Xác nhận mật khẩu *</label>
              <Input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-1">
              {loading ? (
                <Icon icon="svg-spinners:ring-resize" className="text-sm mr-2" />
              ) : (
                <Icon icon="solar:user-plus-bold-duotone" className="text-sm mr-2" />
              )}
              Đăng ký
            </Button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-xs text-muted-foreground">hoặc đăng ký với</span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="/api/auth/github"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
            >
              <Icon icon="mdi:github" className="text-xl" />
              <span>GitHub</span>
            </a>
            <a
              href="/api/auth/google"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
            >
              <Icon icon="flat-color-icons:google" className="text-xl" />
              <span>Google</span>
            </a>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-2">
            Đã có tài khoản?{" "}
            <Link to="/auth/login" className="text-primary font-medium hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        <p className="text-xs text-muted-foreground text-center">
          Bằng việc đăng ký, bạn đồng ý với{" "}
          <Link to="/terms" className="text-primary hover:underline">Điều khoản Dịch vụ</Link>
          {" "}và{" "}
          <Link to="/privacy" className="text-primary hover:underline">Chính sách Bảo mật</Link>
          {" "}của chúng tôi.
        </p>
      </AppDashed>
    </div>
  );
}
