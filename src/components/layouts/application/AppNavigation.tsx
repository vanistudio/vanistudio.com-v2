import { useState, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { Icon } from "@iconify/react";
import AppDashed from "./AppDashed";
import AppHeader from "./AppHeader";
import AppMenuConfig from "./AppMenuConfig";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AppNavigation() {
  const [isFloating, setIsFloating] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const { isAuthenticated } = useAuth();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (navRef.current) {
      const navTop = navRef.current.offsetTop;
      setIsFloating(latest > navTop + 50);
    }
  });

  const navLinks = [
    { name: "Trang chủ", href: "/", icon: "solar:home-smile-bold-duotone" },
    { name: "Sản phẩm", href: "/products", icon: "solar:box-bold-duotone" },
    { name: "Dịch vụ", href: "/services", icon: "solar:code-square-bold-duotone" },
    { name: "Liên hệ", href: "/contact", icon: "solar:chat-round-dots-bold-duotone" },
  ];

  return (
    <>
      <AppHeader />
      <AppMenuConfig isFloating={isFloating} navLinks={navLinks} />
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
          <div className="w-full h-full sm:min-h-[160px] min-h-[100px] bg-dot-grid" />
        </div>
      </div>

      <AppDashed withDotGrid>
        <div className="flex items-stretch justify-between">
          <div className="flex items-end gap-3 px-1">
            <img src="/vanistudio.png" alt="" className="w-[100px] h-[100px] rounded-[8px]" />
            <div className="flex flex-col justify-between py-1 select-none">
              <div className="space-y-0.5">
                <h1 className="text-[1.55rem] font-bold leading-[1.08] text-title">
                  Vani Studio
                </h1>
                <p className="text-muted-foreground text-sm">Thiết kế và phát triển phần mềm</p>
              </div>
            </div>
          </div>
        </div>
      </AppDashed>
      <div ref={navRef} className="relative z-[60]">
        <AppDashed noTopBorder padding="p-2">
          <div className="flex items-center justify-center gap-2 sm:gap-6 text-sm font-medium text-muted-foreground select-none">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const className = "hover:text-foreground transition-colors px-2 py-1 cursor-pointer flex items-center gap-1.5";

              if (isExternal) {
                return (
                  <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                    <Icon icon={link.icon} className="text-xl" />
                    <span className="hidden sm:inline">{link.name}</span>
                  </a>
                );
              }

              return (
                <Link key={link.name} to={link.href} className={className}>
                  <Icon icon={link.icon} className="text-xl" />
                  <span className="hidden sm:inline">{link.name}</span>
                </Link>
              );
            })}
            <Link
              to={isAuthenticated ? "/dashboard" : "/auth/login"}
              className="hover:text-foreground transition-colors px-2 py-1 cursor-pointer flex items-center gap-1.5 text-primary"
            >
              <Icon icon={isAuthenticated ? "solar:widget-bold-duotone" : "solar:login-bold-duotone"} className="text-xl" />
              <span className="hidden sm:inline">{isAuthenticated ? "Dashboard" : "Đăng nhập"}</span>
            </Link>
          </div>
        </AppDashed>
      </div>
    </>
  );
}