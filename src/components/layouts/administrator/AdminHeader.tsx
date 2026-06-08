"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type NavItem = { name: string; href: string; icon: string };
type NavGroup = { name: string; icon: string; children: NavItem[] };
type NavEntry = NavItem | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

const navEntries: NavEntry[] = [
  { name: "Tổng quan", href: "/adminPanel/dashboard", icon: "solar:widget-line-duotone" },
  { name: "Quản lý Menu", href: "/adminPanel/menu", icon: "solar:menu-list-line-duotone" },
  { name: "Xem Website", href: "/", icon: "solar:square-share-line-duotone" },
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

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const setting = useSetting();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useUser();

  const isLinkActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="fixed top-3 left-0 right-0 z-20 px-3 sm:px-5">
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
              <DropdownMenuContent align="end" className="w-64 mt-1.5 p-1.5">
                <DropdownMenuLabel className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-foreground text-[13px] leading-tight truncate">{user.name}</span>
                      <span className="text-[11px] text-muted-foreground leading-normal truncate">{user.email}</span>
                      <span className={cn(
                        "mt-1.5 self-start px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase border",
                        user.role === "admin"
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 dark:bg-purple-500/20"
                          : "bg-primary/5 text-primary border-primary/15"
                      )}>
                        {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                {user.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Hệ thống</DropdownMenuLabel>
                      <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg">
                        <Link href="/adminPanel/dashboard" className="w-full flex items-center gap-2.5 text-sm">
                          <Icon icon="solar:settings-line-duotone" className="text-lg text-primary" />
                          <span className="font-semibold text-foreground">Trang quản trị</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Tài khoản</DropdownMenuLabel>

                  <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg">
                    <Link href="/profile" className="w-full flex items-center gap-2.5 text-sm">
                      <Icon icon="solar:user-id-line-duotone" className="text-lg text-muted-foreground/80" />
                      <span className="font-medium">Hồ sơ cá nhân</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg mt-0.5">
                    <Link href="/profile/security" className="w-full flex items-center gap-2.5 text-sm">
                      <Icon icon="solar:shield-keyhole-line-duotone" className="text-lg text-muted-foreground/80" />
                      <span className="font-medium">Bảo mật tài khoản</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg mt-0.5">
                    <Link href="/profile/history" className="w-full flex items-center gap-2.5 text-sm">
                      <Icon icon="solar:history-line-duotone" className="text-lg text-muted-foreground/80" />
                      <span className="font-medium">Lịch sử giao dịch</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer py-2 px-2.5 rounded-lg">
                      <div className="flex items-center gap-2.5 text-sm w-full">
                        <Icon icon="solar:palette-line-duotone" className="text-lg text-muted-foreground/80" />
                        <span className="font-medium">Giao diện</span>
                      </div>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-36 p-1">
                      <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer py-2 px-2.5 rounded-md text-xs font-semibold">
                        <Icon icon="solar:sun-line-duotone" className="text-base mr-2" />
                        Sáng
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer py-2 px-2.5 rounded-md text-xs font-semibold">
                        <Icon icon="solar:moon-line-duotone" className="text-base mr-2" />
                        Tối
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer py-2 px-2.5 rounded-md text-xs font-semibold">
                        <Icon icon="solar:monitor-line-duotone" className="text-base mr-2" />
                        Hệ thống
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          toast.success("Đăng xuất thành công");
                          router.push("/");
                          router.refresh();
                        }
                      }
                    });
                  }}
                  variant="danger"
                  className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 rounded-lg text-sm focus:bg-destructive/10"
                >
                  <Icon icon="solar:logout-line-duotone" className="text-lg" />
                  <span className="font-bold">Đăng xuất</span>
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
