import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Link } from 'react-router-dom';
import { authRoutes } from '@/services/authentication.service';

export default function AuthLogin() {
  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-6">
        <div className="flex flex-col gap-3 max-w-[380px] mx-auto w-full min-h-[400px] justify-center">
          <a
            href={authRoutes.github}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
          >
            <Icon icon="mdi:github" className="text-xl" />
            <span>Đăng nhập với GitHub</span>
          </a>

          <a
            href={authRoutes.google}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer no-underline"
          >
            <Icon icon="flat-color-icons:google" className="text-xl" />
            <span>Đăng nhập với Google</span>
          </a>
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