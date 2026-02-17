import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface User {
  id: string;
  username: string | null;
  email: string;
  displayName: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  provider: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UserRowProps {
  user: User;
  onToggleActive: (id: string) => void;
  onChangeRole: (id: string, role: "admin" | "user") => void;
  onDelete: (id: string) => void;
}

export function getInitials(user: User): string {
  if (user.fullName) return user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (user.displayName) return user.displayName.slice(0, 2).toUpperCase();
  if (user.username) return user.username.slice(0, 2).toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}

export function getProviderIcon(provider: string) {
  switch (provider) {
    case "github": return "mdi:github";
    case "google": return "flat-color-icons:google";
    default: return "solar:letter-bold-duotone";
  }
}

export function getProviderLabel(provider: string) {
  switch (provider) {
    case "github": return "GitHub";
    case "google": return "Google";
    default: return "Email";
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return `${Math.floor(months / 12)} năm trước`;
}

export default function UserRow({ user, onToggleActive, onChangeRole, onDelete }: UserRowProps) {
  const displayName = user.fullName || user.displayName || user.username || "—";

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group">
      {/* Avatar + Status indicator */}
      <div className="relative shrink-0">
        <Avatar className="size-10">
          <AvatarImage src={user.avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{getInitials(user)}</AvatarFallback>
        </Avatar>
        <div
          className={`absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background ${user.isActive ? "bg-emerald-500" : "bg-zinc-400"}`}
        />
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
          {user.role === "admin" && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 font-semibold">
              <Icon icon="solar:shield-check-bold" className="text-[10px] mr-0.5" />
              Admin
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          {user.username && (
            <>
              <span className="text-muted-foreground/40 text-[10px]">•</span>
              <span className="text-xs text-muted-foreground/70 truncate">@{user.username}</span>
            </>
          )}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-4 shrink-0">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                <Icon icon={getProviderIcon(user.provider)} className="text-sm" />
                <span className="text-[11px] text-muted-foreground font-medium">{getProviderLabel(user.provider)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Đăng nhập qua {getProviderLabel(user.provider)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] text-muted-foreground/70 tabular-nums">{timeAgo(user.createdAt)}</span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {new Date(user.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
          >
            <Icon icon="solar:menu-dots-bold" className="text-base" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onToggleActive(user.id)}>
            <Icon icon={user.isActive ? "solar:close-circle-bold-duotone" : "solar:check-circle-bold-duotone"} className="mr-2 text-base" />
            {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeRole(user.id, user.role === "admin" ? "user" : "admin")}>
            <Icon icon="solar:shield-user-bold-duotone" className="mr-2 text-base" />
            {user.role === "admin" ? "Hạ quyền User" : "Nâng quyền Admin"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(user.id)}>
            <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
            Xóa người dùng
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
