import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";

export default function NotFound() {
  usePageTitle("404");

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <div className="flex-grow flex flex-col items-center justify-center">
        <AppDashed padding="p-0">
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Icon icon="solar:ghost-bold-duotone" className="text-3xl text-primary" />
            </div>
            <h1 className="text-6xl font-bold text-title mb-2">404</h1>
            <p className="text-sm text-muted-foreground mb-6">Trang bạn tìm kiếm không tồn tại hoặc đã bị xóa</p>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="text-xs gap-1.5">
                <Link to="/">
                  <Icon icon="solar:home-2-bold-duotone" className="text-sm" />
                  Về trang chủ
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
                <Link to="/admin">
                  <Icon icon="solar:widget-bold-duotone" className="text-sm" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </AppDashed>
      </div>
    </div>
  );
}
