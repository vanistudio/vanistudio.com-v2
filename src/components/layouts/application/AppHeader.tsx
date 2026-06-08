"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useSetting } from "@/contexts/SettingContext";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUser } from "@/contexts/UserContext";
import { signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type NavItem = { name: string; href: string; icon: string };
type NavGroup = { name: string; icon: string; children: NavItem[] };
type NavEntry = NavItem | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

const navEntries: NavEntry[] = [
  { name: "Trang chủ", href: "/", icon: "solar:home-2-line-duotone" },
  {
    name: "Dịch vụ",
    icon: "solar:server-square-line-duotone",
    children: [
      { name: "Thiết kế Website", href: "/services/website", icon: "solar:monitor-line-duotone" },
      { name: "Lập trình di động", href: "/services/mobile", icon: "solar:smartphone-line-duotone" },
      { name: "Chatbot AI", href: "/services/chatbot", icon: "solar:magic-stick-3-line-duotone" },
      { name: "Thiết kế UI/UX", href: "/services/ui-ux", icon: "solar:palette-line-duotone" },
    ],
  },
  { name: "Dự án", href: "/projects", icon: "solar:folder-open-line-duotone" },
  { name: "Sản phẩm", href: "/products", icon: "solar:box-line-duotone" },
  { name: "Tin tức", href: "/blog", icon: "solar:document-text-line-duotone" },
  { name: "Liên hệ", href: "/contact", icon: "solar:letter-line-duotone" },
];

function NavGroupPopover({ group, isLinkActive }: { group: NavGroup; isLinkActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const groupActive = group.children.some((c) => isLinkActive(c.href));

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-bold cursor-default transition-colors",
          groupActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon icon={group.icon} className="text-lg" />
        <span>{group.name}</span>
        <Icon
          icon="solar:alt-arrow-down-bold"
          className={cn("text-[9px] opacity-50 transition-transform duration-200", open && "rotate-180")}
        />
      </span>

      <div
        className={cn(
          "absolute top-full left-0 pt-1 z-50 transition-all duration-200 origin-top",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="min-w-[220px] rounded-xl border border-border bg-background shadow-lg p-1.5 flex flex-col gap-0.5">
          {group.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors outline-none",
                isLinkActive(child.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon icon={child.icon} className="text-lg" />
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileAccordion({
  group,
  isLinkActive,
  onNavigate,
}: {
  group: NavGroup;
  isLinkActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(() => group.children.some((c) => isLinkActive(c.href)));

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-bold transition-colors outline-none",
          group.children.some((c) => isLinkActive(c.href))
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Icon icon={group.icon} className="text-lg" />
        <span className="grow text-left">{group.name}</span>
        <Icon
          icon="solar:alt-arrow-down-bold"
          className={cn("text-[9px] opacity-50 transition-transform duration-200", expanded && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-4 flex flex-col gap-0.5 pb-1 mt-0.5">
          {group.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors outline-none",
                isLinkActive(child.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon icon={child.icon} className="text-base" />
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AppHeader() {
  const pathname = usePathname();
  const setting = useSetting();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useUser();

  const isLinkActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-3 z-20 w-full px-3 sm:px-5">
      <div className="flex items-center h-14 gap-2 px-3 py-2 rounded-xl border border-border/80 bg-background/80 backdrop-blur-xl shadow-sm">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors xl:hidden">
              <Icon icon="solar:hamburger-menu-line-duotone" className="text-lg" />
            </button>
          </SheetTrigger>
          <SheetContent showCloseButton={false} side="left" className="w-[260px] p-0 border-r-border/50 overflow-y-auto">
            <SheetHeader className="hidden">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 py-5 px-3">
              {navEntries.map((entry) =>
                isGroup(entry) ? (
                  <MobileAccordion
                    key={entry.name}
                    group={entry}
                    isLinkActive={isLinkActive}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                ) : (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors outline-none",
                      isLinkActive(entry.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon icon={entry.icon} className="text-lg" />
                    {entry.name}
                  </Link>
                )
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2 md:mr-6">
          <img
            src={setting?.siteLogo || "/vani-1.png"}
            alt="Logo"
            className="h-9 w-auto object-contain rounded-lg"
          />
        </Link>

        <nav className="hidden xl:flex items-center gap-0.5 grow">
          {navEntries.map((entry) =>
            isGroup(entry) ? (
              <NavGroupPopover key={entry.name} group={entry} isLinkActive={isLinkActive} />
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-colors outline-none",
                  isLinkActive(entry.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon icon={entry.icon} className="text-lg" />
                <span>{entry.name}</span>
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-9 rounded-xl items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none"
          >
            <Icon icon="solar:sun-line-duotone" className="text-xl dark:hidden" />
            <Icon icon="solar:moon-line-duotone" className="text-xl hidden dark:block" />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-90 outline-none select-none">
                  <Avatar className="cursor-pointer border border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1.5 p-1.5">
                <DropdownMenuLabel className="flex flex-col gap-0.5 p-2.5">
                  <span className="font-semibold text-foreground text-sm leading-none truncate">{user.name}</span>
                  <span className="text-[11px] text-muted-foreground leading-none truncate">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {user.role === "admin" && (
                  <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg">
                    <Link href="/configuration" className="w-full flex items-center gap-2.5 text-sm">
                      <Icon icon="solar:settings-line-duotone" className="text-lg text-muted-foreground" />
                      <span>Cấu hình hệ thống</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg mt-0.5">
                  <Link href="/profile" className="w-full flex items-center gap-2.5 text-sm">
                    <Icon icon="solar:user-id-line-duotone" className="text-lg text-muted-foreground" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    await signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          window.location.reload();
                        }
                      }
                    });
                  }}
                  variant="destructive"
                  className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 rounded-lg text-sm focus:bg-destructive/10"
                >
                  <Icon icon="solar:logout-line-duotone" className="text-lg" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-9 rounded-xl text-sm font-semibold outline-none select-none gap-2 cursor-pointer"
                >
                  <Icon icon="solar:user-line-duotone" className="text-lg" />
                  <span>Tài khoản</span>
                  <Icon icon="solar:alt-arrow-down-line-duotone" className="text-xs opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-1.5 p-1.5">
                <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg">
                  <Link href="/authentication/login" className="w-full flex items-center gap-2.5 text-sm">
                    <Icon icon="solar:login-line-duotone" className="text-lg text-muted-foreground" />
                    <span>Đăng nhập</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg mt-0.5">
                  <Link href="/authentication/register" className="w-full flex items-center gap-2.5 text-sm">
                    <Icon icon="solar:user-plus-line-duotone" className="text-lg text-muted-foreground" />
                    <span>Đăng ký</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

