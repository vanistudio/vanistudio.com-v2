import { Outlet, Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import AppDashed from "@/components/layouts/application/AppDashed";
import AppHeader from "@/components/layouts/application/AppHeader";
import AppFooter from "@/components/layouts/application/AppFooter";
import { cn } from "@/lib/utils";

const adminNavLinks = [
  { name: "Dashboard", href: "/admin", icon: "solar:widget-bold-duotone" },
  { name: "Người dùng", href: "/admin/users", icon: "solar:users-group-rounded-bold-duotone" },
  { name: "Chuyên mục", href: "/admin/categories", icon: "solar:folder-bold-duotone" },
  { name: "Sản phẩm", href: "/admin/products", icon: "solar:box-bold-duotone" },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      <AppHeader />

      <div className="relative z-50 bg-background">
        <div
          className="max-w-5xl mx-5 md:mx-auto relative p-3"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px)",
            backgroundPosition: "left top, right top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "1px 100%, 1px 100%",
          }}>
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:shield-user-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title leading-tight">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Quản trị hệ thống Vani Studio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[60]">
        <AppDashed noTopBorder padding="p-2">
          <div className="flex items-center justify-center gap-2 sm:gap-6 text-sm font-medium text-muted-foreground select-none">
            {adminNavLinks.map((link) => {
              const isActive = location.pathname === link.href ||
                (link.href !== "/admin" && location.pathname.startsWith(link.href));

              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "hover:text-foreground transition-colors px-2 py-1 cursor-pointer flex items-center gap-1.5",
                    isActive && "text-primary"
                  )}
                >
                  <Icon icon={link.icon} className="text-xl" />
                  <span className="hidden sm:inline">{link.name}</span>
                </Link>
              );
            })}
            <Link
              to="/"
              className="hover:text-foreground transition-colors px-2 py-1 cursor-pointer flex items-center gap-1.5"
            >
              <Icon icon="solar:arrow-left-bold-duotone" className="text-xl" />
              <span className="hidden sm:inline">Về trang chủ</span>
            </Link>
          </div>
        </AppDashed>
      </div>

      <main className="flex-grow flex flex-col items-center">
        <div className="w-full">
          <Outlet />
        </div>
        <div className="flex-grow w-full flex">
          <div
            className="flex-grow max-w-5xl mx-5 md:mx-auto"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px), repeating-linear-gradient(to bottom, var(--border-color) 0px, var(--border-color) 6px, transparent 6px, transparent 14px)",
              backgroundPosition: "left top, right top",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1px 100%, 1px 100%",
            }}
          />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
