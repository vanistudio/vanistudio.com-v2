import { Icon } from '@iconify/react';
import AppDashed from '@/components/layouts/application/AppDashed';
import { Link } from 'react-router-dom';

export default function AuthLogin() {
  return (
    <div className="flex flex-col w-full flex-grow">
      <AppDashed noTopBorder withDotGrid>
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <Link to="/">
            <img src="/vanistudio.png" alt="" className="w-[80px] h-[80px] rounded-[8px]" />
          </Link>
          <div className="text-center select-none space-y-1">
            <h1 className="text-xl font-bold leading-tight text-title">
              Đăng nhập
            </h1>
            <p className="text-muted-foreground text-sm">
              Chào mừng trở lại với Vani Studio
            </p>
          </div>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-6">
        <div className="flex flex-col gap-3 max-w-[380px] mx-auto w-full">
          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer"
          >
            <Icon icon="mdi:github" className="text-xl" />
            <span>Đăng nhập với GitHub</span>
          </button>

          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:bg-muted-background transition-colors text-sm font-medium text-foreground cursor-pointer"
          >
            <Icon icon="flat-color-icons:google" className="text-xl" />
            <span>Đăng nhập với Google</span>
          </button>
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
