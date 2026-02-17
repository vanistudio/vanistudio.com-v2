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

interface User {
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

function getInitials(user: User): string {
  if (user.fullName) return user.fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  if (user.displayName) return user.displayName.slice(0, 2).toUpperCase();
  if (user.username) return user.username.slice(0, 2).toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}

function getProviderIcon(provider: string) {
  switch (provider) {
    case "github": return "mdi:github";
    case "google": return "flat-color-icons:google";
    default: return "solar:letter-bold-duotone";
  }
}

export default function UserRow({ user, onToggleActive, onChangeRole, onDelete }: UserRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group">
      <Avatar className="size-9 shrink-0">
        <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.email} />
        <AvatarFallback className="text-xs font-medium">{getInitials(user)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {user.fullName || user.displayName || user.username || "—"}
          </span>
          <Icon icon={getProviderIcon(user.provider)} className="text-sm text-muted-foreground shrink-0" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{user.email}</span>
          {user.username && (
            <>
              <span>·</span>
              <span className="truncate">@{user.username}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant={user.role === "admin" ? "default" : "secondary"}
          className="text-[10px] px-1.5 py-0"
        >
          {user.role}
        </Badge>
        <div className={`size-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon icon="solar:menu-dots-bold" className="text-base" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onToggleActive(user.id)}>
              <Icon icon={user.isActive ? "solar:close-circle-bold-duotone" : "solar:check-circle-bold-duotone"} className="mr-2 text-base" />
              {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeRole(user.id, user.role === "admin" ? "user" : "admin")}>
              <Icon icon="solar:shield-user-bold-duotone" className="mr-2 text-base" />
              {user.role === "admin" ? "Hạ quyền User" : "Nâng quyền Admin"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(user.id)}>
              <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
              Xóa người dùng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
