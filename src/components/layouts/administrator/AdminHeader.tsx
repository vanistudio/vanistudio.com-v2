import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = { name: string; href: string; icon: string };
type NavGroup = { name: string; icon: string; children: NavItem[] };
type NavEntry = NavItem | NavGroup;

const isGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

const navEntries: NavEntry[] = [
  { name: "Dashboard", href: "/admin", icon: "solar:widget-bold-duotone" },
  { name: "Người dùng", href: "/admin/users", icon: "solar:users-group-rounded-bold-duotone" },
  {
    name: "Nội dung", icon: "solar:layers-bold-duotone",
    children: [
      { name: "Chuyên mục", href: "/admin/categories", icon: "solar:folder-bold-duotone" },
      { name: "Sản phẩm", href: "/admin/products", icon: "solar:box-bold-duotone" },
      { name: "Dịch vụ", href: "/admin/services", icon: "solar:widget-5-bold-duotone" },
      { name: "Blog", href: "/admin/blog", icon: "solar:document-text-bold-duotone" },
    ],
  },
  {
    name: "Dự án", icon: "solar:case-round-bold-duotone",
    children: [
      { name: "Project", href: "/admin/projects", icon: "solar:code-bold-duotone" },
      { name: "License", href: "/admin/licenses", icon: "solar:key-bold-duotone" },
    ],
  },
  {
    name: "Hệ thống", icon: "solar:settings-bold-duotone",
    children: [
      { name: "Cài đặt", href: "/admin/settings", icon: "solar:tuning-2-bold-duotone" },
      { name: "Tin nhắn", href: "/admin/contacts", icon: "solar:chat-round-dots-bold-duotone" },
      { name: "Request Logs", href: "/admin/requests", icon: "solar:chart-2-bold-duotone" },
      { name: "Database", href: "/admin/database", icon: "solar:database-bold-duotone" },
    ],
  },
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
          "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium cursor-default transition-colors",
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
        <div className="min-w-[220px] rounded-lg border border-border bg-background shadow-lg p-1.5">
          {group.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
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
  group, isLinkActive, onNavigate,
}: {
  group: NavGroup; isLinkActive: (href: string) => boolean; onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(() => group.children.some((c) => isLinkActive(c.href)));

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors",
          group.children.some((c) => isLinkActive(c.href))
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Icon icon={group.icon} className="text-lg" />
        <span className="flex-grow text-left">{group.name}</span>
        <Icon
          icon="solar:alt-arrow-down-bold"
          className={cn("text-[9px] opacity-50 transition-transform duration-200", expanded && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-4 flex flex-col gap-0.5 pb-1">
          {group.children.map((child) => (
            <Link
              key={child.href}
              to={child.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                isLinkActive(child.href)
                  ? "text-primary"
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
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLinkActive = (href: string) =>
    location.pathname === href || (href !== "/admin" && location.pathname.startsWith(href));

  return (
    <header className="sticky top-3 z-20 w-full px-3 sm:px-5">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-sm">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden">
              <Icon icon="solar:hamburger-menu-bold-duotone" className="text-lg" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0">
            <nav className="flex flex-col gap-0.5 py-5 px-2">
              {navEntries.map((entry) =>
                isGroup(entry) ? (
                  <MobileAccordion key={entry.name} group={entry} isLinkActive={isLinkActive} onNavigate={() => setSidebarOpen(false)} />
                ) : (
                  <Link
                    key={entry.href}
                    to={entry.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors",
                      isLinkActive(entry.href)
                        ? "text-primary"
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
        <Link to="/admin" className="flex items-center gap-2 shrink-0 mr-2 md:mr-6">
          <img src="/vanistudio.png" alt="Logo" className="h-10" />
        </Link>
        <nav className="hidden md:flex items-center gap-0.5 flex-grow">
          {navEntries.map((entry) =>
            isGroup(entry) ? (
              <NavGroupPopover key={entry.name} group={entry} isLinkActive={isLinkActive} />
            ) : (
              <Link
                key={entry.href}
                to={entry.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                  isLinkActive(entry.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon icon={entry.icon} className="text-lg" />
                <span>{entry.name}</span>
              </Link>
            )
          )}
        </nav>
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex size-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Icon icon="solar:sun-bold-duotone" className="text-base dark:hidden" />
            <Icon icon="solar:moon-bold-duotone" className="text-base hidden dark:block" />
          </button>
          <Link
            to="/"
            className="hidden md:flex size-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Về trang chủ"
          >
            <Icon icon="solar:home-2-bold-duotone" className="text-base" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-1 pr-1 md:pl-2 md:pr-2 py-1 rounded-lg hover:bg-muted transition-colors">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="size-6 rounded-full object-cover" />
                ) : (
                  <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon icon="solar:user-bold-duotone" className="text-xs text-primary" />
                  </div>
                )}
                <Icon icon="solar:alt-arrow-down-bold" className="text-[10px] text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground truncate">{user?.displayName || user?.email}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin" className="cursor-pointer">
                  <Icon icon="solar:widget-bold-duotone" className="mr-2 text-base" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer">
                  <Icon icon="solar:home-2-bold-duotone" className="mr-2 text-base" />
                  Về trang chủ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => logout()}>
                <Icon icon="solar:logout-2-bold-duotone" className="mr-2 text-base" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
