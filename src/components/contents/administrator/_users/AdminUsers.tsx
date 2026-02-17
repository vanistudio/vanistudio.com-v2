import { useState, useEffect, useCallback, useMemo } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";
import UserRow, { type User } from "./UserRow";

export default function AdminUsers() {
  usePageTitle("Quản lý Người dùng");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search) {
        const q = search.toLowerCase();
        const match = [u.fullName, u.displayName, u.email, u.username]
          .filter(Boolean).join(" ").toLowerCase();
        if (!match.includes(q)) return false;
      }
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "active" && !u.isActive) return false;
      if (statusFilter === "inactive" && u.isActive) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const active = users.filter((u) => u.isActive).length;
    const inactive = total - active;
    return [
      { label: "Tổng người dùng", value: total, icon: "solar:users-group-rounded-bold-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Admin", value: admins, icon: "solar:shield-user-bold-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
      { label: "Đang hoạt động", value: active, icon: "solar:check-circle-bold-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Vô hiệu hóa", value: inactive, icon: "solar:close-circle-bold-duotone", bgColor: "bg-red-500/10", textColor: "text-red-500" },
    ];
  }, [users]);

  const activeFilterCount = (roleFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);
  const clearFilters = () => { setRoleFilter("all"); setStatusFilter("all"); };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Quản lý Người dùng</h1>
              <p className="text-xs text-muted-foreground">{users.length} người dùng</p>
            </div>
          </div>
        </div>
      </AppDashed>

      <AdminStats items={stats} />

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm theo tên, email, username..."
              className="pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="text-xs gap-1.5 shrink-0">
                <Icon icon="solar:filter-bold-duotone" className="text-sm" />
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="size-4 p-0 flex items-center justify-center text-[9px] rounded-full ml-0.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[240px] p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Bộ lọc</span>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-[11px] text-primary hover:underline cursor-pointer">
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Vai trò</span>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Trạng thái</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Vô hiệu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search || roleFilter !== "all" || statusFilter !== "all"
                ? "Không tìm thấy người dùng phù hợp"
                : "Chưa có người dùng nào"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <div className="w-10 shrink-0" />
              <div className="flex-1">Người dùng</div>
              <div className="hidden sm:flex items-center gap-4 shrink-0">
                <div className="w-[90px]">Nhà cung cấp</div>
                <div className="w-[80px]">Tham gia</div>
              </div>
              <div className="w-8 shrink-0" />
            </div>
            <div className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onToggleActive={handleToggleActive}
                  onChangeRole={handleChangeRole}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredUsers.length} / {users.length} người dùng
              </span>
            </div>
          </>
        )}
      </AppDashed>
    </div>
  );
}
