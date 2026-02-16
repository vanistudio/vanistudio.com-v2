import { useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useScroll, useMotionValueEvent } from "framer-motion";
import { SiDiscord } from "react-icons/si";
import { FaRankingStar } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { BiSolidDashboard } from "react-icons/bi";
import { Link } from "react-router-dom";
import AppDashed from "./AppDashed";
import AppHeader from "./AppHeader";
import AppMenuConfig from "./AppMenuConfig";
import AppFooter from "./AppFooter";

const navLinks = [
  { name: "Home", href: "/", icon: IoHome },
  { name: "Ranking", href: "/ranking", icon: FaRankingStar },
  { name: "Discord", href: "https://discord.gg/tsbvh", icon: SiDiscord },
  { name: "Dashboard", href: "/dashboard", icon: BiSolidDashboard },
];

const AppLayout = () => {
  const [isFloating, setIsFloating] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (navRef.current) {
      const navTop = navRef.current.offsetTop;
      setIsFloating(latest > navTop + 50);
    }
  });

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
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

      <div ref={navRef} className="relative z-[60]">
        <AppDashed noTopBorder padding="p-2">
          <div className="flex items-center justify-center gap-2 sm:gap-6 text-sm font-medium text-muted-foreground select-none">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const className = "hover:text-foreground transition-colors px-2 py-1 cursor-pointer flex items-center gap-1.5";

              if (isExternal) {
                return (
                  <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                    <link.icon size={20} className="" />
                    <span className="hidden sm:inline">{link.name}</span>
                  </a>
                );
              }

              return (
                <Link key={link.name} to={link.href} className={className}>
                  <link.icon size={20} className="" />
                  <span className="hidden sm:inline">{link.name}</span>
                </Link>
              );
            })}
          </div>
        </AppDashed>
      </div>

      <main className="flex-grow flex flex-col items-center">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
      <AppFooter />
    </div>
  );
};
export default AppLayout;