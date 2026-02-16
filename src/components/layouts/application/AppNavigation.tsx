import { useState, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import AppDashed from "./AppDashed";
import AppHeader from "./AppHeader";
import { SiDiscord } from "react-icons/si";
import { FaRankingStar } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import AppMenuConfig from "./AppMenuConfig";
import { Link } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi";
export default function AppNavigation() {
  const [isFloating, setIsFloating] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (navRef.current) {
      const navTop = navRef.current.offsetTop;
      setIsFloating(latest > navTop + 50);
    }
  });

  const navLinks = [
    { name: "Home", href: "/", icon: IoHome },
    { name: "Ranking", href: "/ranking", icon: FaRankingStar },
    { name: "Discord", href: "https://discord.gg/tsbvh", icon: SiDiscord },
    { name: "Dashboard", href: "/dashboard", icon: BiSolidDashboard },
  ];

  return (
    <>
      <AppHeader />
      <AppMenuConfig isFloating={isFloating} navLinks={navLinks} />
      <div className="relative z-50 bg-background">
        <div
          className="max-w-[800px] mx-5 md:mx-auto relative p-3"
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
            <div className="border border-border rounded-[12px] p-[4px] bg-background hover:brightness-90 transition duration-300 group">
              <img src="/image1.png" alt="" className="w-[100px] h-[100px] rounded-[8px]" />
            </div>
            <div className="flex flex-col justify-between py-1 select-none">
              <div className="space-y-0.5">
                <h1 className="text-[1.55rem] font-bold leading-[1.08] text-title">
                  Vani Studio
                </h1>
                <p className="text-muted-foreground text-sm">The Strongest Battleground Viet Hub</p>
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
    </>
  );
}