import { useState, useEffect, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import AppDashed from "@/components/layouts/application/AppDashed";
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
import { DataTable, DataTableToolbar, DataTableFacetedFilter } from "@/components/vani/datatable";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";

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

export default function AdminUsers() {
  usePageTitle("Quản lý Người dùng");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.api.admin.users.get({
        query: { page: "1", limit: "500", sortBy: "createdAt", sortOrder: "desc" },
      });
      if (data?.success) {
        setUsers((data as any).users || []);
      }
    } catch {
      toast.error("Lỗi", { description: "Không thể tải danh sách người dùng" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (id: string) => {
    try {
      const { data } = await api.api.admin.users({ id })["toggle-active"].patch();
      if (data?.success) { toast.success("Cập nhật thành công"); fetchUsers(); }
      else toast.error("Thất bại", { description: (data as any)?.error });
    } catch { toast.error("Lỗi kết nối"); }
  };

  const handleChangeRole = async (id: string, role: "admin" | "user") => {
    try {
      const { data } = await api.api.admin.users({ id }).role.patch({ role });
      if (data?.success) { toast.success("Cập nhật quyền thành công"); fetchUsers(); }
      else toast.error("Thất bại", { description: (data as any)?.error });
    } catch { toast.error("Lỗi kết nối"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      const { data } = await api.api.admin.users({ id }).delete();
      if (data?.success) { toast.success("Đã xóa người dùng"); fetchUsers(); }
      else toast.error("Thất bại", { description: (data as any)?.error });
    } catch { toast.error("Lỗi kết nối"); }
  };

  // ── Stats ──
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    return [
      { label: "Tổng người dùng", value: total, icon: "solar:users-group-rounded-bold-duotone", color: "bg-blue-500/10" },
      { label: "Admin", value: admins, icon: "solar:shield-user-bold-duotone", color: "bg-amber-500/10" },
      { label: "Đang hoạt động", value: active, icon: "solar:check-circle-bold-duotone", color: "bg-emerald-500/10" },
      { label: "Vô hiệu hóa", value: inactive, icon: "solar:close-circle-bold-duotone", color: "bg-red-500/10" },
    ];
  }, [users]);

  // ── Columns ──
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: "fullName",
      header: "Người dùng",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.email} />
              <AvatarFallback className="text-[10px] font-medium">{getInitials(user)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground truncate">
                  {user.fullName || user.displayName || user.username || "—"}
                </span>
                <Icon icon={getProviderIcon(user.provider)} className="text-xs text-muted-foreground shrink-0" />
              </div>
              <span className="text-xs text-muted-foreground truncate block">{user.email}</span>
            </div>
          </div>
        );
      },
      filterFn: (row, _, value) => {
        const u = row.original;
        const text = `${u.fullName || ""} ${u.displayName || ""} ${u.email} ${u.username || ""}`.toLowerCase();
        return text.includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      size: 100,
      cell: ({ getValue }) => {
        const role = getValue<string>();
        return <Badge variant={role === "admin" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">{role}</Badge>;
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      size: 110,
      cell: ({ getValue }) => {
        const active = getValue<boolean>();
        return (
          <div className="flex items-center gap-1.5">
            <div className={`size-2 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="text-xs text-muted-foreground">{active ? "Hoạt động" : "Vô hiệu"}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      size: 120,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(getValue<string>()).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      id: "actions",
      size: 50,
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <Icon icon="solar:menu-dots-bold" className="text-base" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => handleToggleActive(user.id)}>
                <Icon icon={user.isActive ? "solar:close-circle-bold-duotone" : "solar:check-circle-bold-duotone"} className="mr-2 text-base" />
                {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangeRole(user.id, user.role === "admin" ? "user" : "admin")}>
                <Icon icon="solar:shield-user-bold-duotone" className="mr-2 text-base" />
                {user.role === "admin" ? "Hạ quyền User" : "Nâng quyền Admin"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user.id)}>
                <Icon icon="solar:trash-bin-trash-bold-duotone" className="mr-2 text-base" />
                Xóa người dùng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  if (loading) {
    return (
      <div className="flex flex-col w-full">
        <AppDashed noTopBorder padding="p-0">
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        </AppDashed>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-title">Quản lý Người dùng</h1>
            <p className="text-xs text-muted-foreground">{users.length} người dùng</p>
          </div>
        </div>
      </AppDashed>

      {/* Stats */}
      <AdminStats items={stats} />

      {/* DataTable */}
      <AppDashed noTopBorder padding="p-0">
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Tìm theo tên, email..."
          compact
          emptyIcon="solar:users-group-rounded-bold-duotone"
          emptyMessage="Không tìm thấy người dùng"
          toolbar={(table) => (
            <DataTableToolbar table={table} searchPlaceholder="Tìm theo tên, email...">
              <DataTableFacetedFilter
                column={table.getColumn("role")}
                title="Vai trò"
                options={[
                  { label: "Admin", value: "admin", icon: "solar:shield-user-bold-duotone" },
                  { label: "User", value: "user", icon: "solar:user-bold-duotone" },
                ]}
              />
              <DataTableFacetedFilter
                column={table.getColumn("isActive")}
                title="Trạng thái"
                options={[
                  { label: "Hoạt động", value: "true", icon: "solar:check-circle-bold-duotone" },
                  { label: "Vô hiệu", value: "false", icon: "solar:close-circle-bold-duotone" },
                ]}
              />
            </DataTableToolbar>
          )}
        />
      </AppDashed>
    </div>
  );
}
