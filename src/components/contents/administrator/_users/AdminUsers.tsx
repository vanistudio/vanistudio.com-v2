import { useState, useEffect, useCallback } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";
import UserRow from "./UserRow";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsers() {
  usePageTitle("Quản lý Người dùng");

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.api.admin.users.get({
        query: {
          page: String(page),
          limit: "20",
          search: search || undefined,
          role: roleFilter !== "all" ? roleFilter : undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });

      if (data?.success) {
        setUsers((data as any).users || []);
        setPagination((data as any).pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch {
      toast.error("Lỗi", { description: "Không thể tải danh sách người dùng" });
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (id: string) => {
    try {
      const { data } = await api.api.admin.users({ id })["toggle-active"].patch();
      if (data?.success) {
        toast.success("Cập nhật thành công");
        fetchUsers(pagination.page);
      } else {
        toast.error("Thất bại", { description: (data as any)?.error });
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const handleChangeRole = async (id: string, role: "admin" | "user") => {
    try {
      const { data } = await api.api.admin.users({ id }).role.patch({ role });
      if (data?.success) {
        toast.success("Cập nhật quyền thành công");
        fetchUsers(pagination.page);
      } else {
        toast.error("Thất bại", { description: (data as any)?.error });
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      const { data } = await api.api.admin.users({ id }).delete();
      if (data?.success) {
        toast.success("Đã xóa người dùng");
        fetchUsers(pagination.page);
      } else {
        toast.error("Thất bại", { description: (data as any)?.error });
      }
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="text-xl text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-title">Quản lý Người dùng</h1>
            <p className="text-xs text-muted-foreground">
              {pagination.total} người dùng
            </p>
          </div>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm theo tên, email, username..."
              className="pl-8 h-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[120px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon icon="solar:spinner-bold-duotone" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:users-group-rounded-bold-duotone" className="text-4xl text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Không tìm thấy người dùng</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onToggleActive={handleToggleActive}
                onChangeRole={handleChangeRole}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </AppDashed>

      {pagination.totalPages > 1 && (
        <AppDashed noTopBorder padding="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Trang {pagination.page} / {pagination.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1)}
              >
                <Icon icon="solar:arrow-left-linear" className="text-sm mr-1" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.page + 1)}
              >
                Sau
                <Icon icon="solar:arrow-right-linear" className="text-sm ml-1" />
              </Button>
            </div>
          </div>
        </AppDashed>
      )}
    </div>
  );
}
