import { useState, useEffect, useCallback, useMemo } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminStats from "@/components/vani/AdminStats";
import { usePageTitle } from "@/hooks/use-page-title";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PERMISSION_GROUPS } from "@/constants/permissions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/vani/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  createdAt: string;
}

export default function AdminRoles() {
  usePageTitle("Phân quyền");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await (api.api.admin as any).roles.get();
      if (data?.success) setRoles(data.roles || []);
    } catch {
      toast.error("Không thể tải danh sách role");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const openCreate = () => {
    setEditingRole(null);
    setForm({ name: "", description: "", permissions: [] });
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description || "", permissions: [...role.permissions] });
    setDialogOpen(true);
  };

  const handleTogglePermission = (key: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((p) => p !== key)
        : [...prev.permissions, key],
    }));
  };

  const handleToggleAll = () => {
    const allKeys = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));
    const allSelected = allKeys.every((k) => form.permissions.includes(k));
    setForm((prev) => ({
      ...prev,
      permissions: allSelected ? [] : allKeys,
    }));
  };

  const handleToggleModule = (modulePermissions: { key: string }[]) => {
    const keys = modulePermissions.map((p) => p.key);
    const allSelected = keys.every((k) => form.permissions.includes(k));
    setForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !keys.includes(p))
        : [...new Set([...prev.permissions, ...keys])],
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Tên role không được trống"); return; }
    setSaving(true);
    try {
      if (editingRole) {
        const { data } = await (api.api.admin as any).roles({ id: editingRole.id }).patch(form);
        if (data?.success) { toast.success("Đã cập nhật role"); setDialogOpen(false); fetchRoles(); }
        else toast.error(data?.error || "Cập nhật thất bại");
      } else {
        const { data } = await (api.api.admin as any).roles.post(form);
        if (data?.success) { toast.success("Đã tạo role"); setDialogOpen(false); fetchRoles(); }
        else toast.error(data?.error || "Tạo role thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { data } = await (api.api.admin as any).roles({ id: deleteTarget }).delete();
      if (data?.success) { toast.success("Đã xóa role"); fetchRoles(); }
      else toast.error(data?.error || "Xóa thất bại");
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredRoles = useMemo(() => {
    if (!search) return roles;
    const q = search.toLowerCase();
    return roles.filter((r) =>
      [r.name, r.description].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [roles, search]);

  const stats = useMemo(() => {
    const total = roles.length;
    const system = roles.filter((r) => r.isSystem).length;
    const custom = total - system;
    const totalUsers = roles.reduce((acc, r) => acc + r.userCount, 0);
    return [
      { label: "Tổng role", value: total, icon: "solar:shield-keyhole-line-duotone", bgColor: "bg-blue-500/10", textColor: "text-blue-500" },
      { label: "Hệ thống", value: system, icon: "solar:shield-star-line-duotone", bgColor: "bg-amber-500/10", textColor: "text-amber-500" },
      { label: "Tùy chỉnh", value: custom, icon: "solar:shield-plus-line-duotone", bgColor: "bg-emerald-500/10", textColor: "text-emerald-500" },
      { label: "Tổng người dùng", value: totalUsers, icon: "solar:users-group-rounded-line-duotone", bgColor: "bg-violet-500/10", textColor: "text-violet-500" },
    ];
  }, [roles]);

  return (
    <div className="flex flex-col w-full">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon="solar:shield-keyhole-line-duotone" className="text-xl text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-title">Phân quyền</h1>
              <p className="text-xs text-muted-foreground">{roles.length} role</p>
            </div>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-1.5" />
            Tạo role
          </Button>
        </div>
      </AppDashed>

      <AdminStats items={stats} />

      <AppDashed noTopBorder padding="p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm theo tên role..."
              className="pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-0" scrollable>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground animate-spin" />
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:shield-keyhole-line-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? "Không tìm thấy role phù hợp" : "Chưa có role nào"}
            </p>
          </div>
        ) : (
          <div className="w-max min-w-full">
            <div className="flex items-center gap-4 px-4 py-2 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              <div className="w-10 shrink-0" />
              <div className="flex-1 min-w-[180px]">Role</div>
              <div className="w-[100px]">Quyền</div>
              <div className="w-[100px]">Người dùng</div>
              <div className="w-[80px]">Loại</div>
              <div className="w-8 shrink-0" />
            </div>
            <div className="divide-y divide-border">
              {filteredRoles.map((role) => (
                <div key={role.id} className="flex items-center gap-4 px-4 py-3 whitespace-nowrap">
                  <div className="w-10 shrink-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon icon={role.permissions.includes("*") ? "solar:shield-star-bold-duotone" : "solar:shield-keyhole-bold-duotone"} className="text-base text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <div className="text-sm font-semibold text-title">{role.name}</div>
                    {role.description && <div className="text-[11px] text-muted-foreground truncate max-w-[240px]">{role.description}</div>}
                  </div>
                  <div className="w-[100px]">
                    <span className="text-xs text-muted-foreground">
                      {role.permissions.includes("*") ? "Toàn quyền" : `${role.permissions.length} quyền`}
                    </span>
                  </div>
                  <div className="w-[100px]">
                    <span className="text-xs text-muted-foreground">{role.userCount}</span>
                  </div>
                  <div className="w-[80px]">
                    {role.isSystem ? (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">Hệ thống</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Tùy chỉnh</Badge>
                    )}
                  </div>
                  <div className="w-8 shrink-0 flex items-center justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer">
                          <Icon icon="solar:menu-dots-bold" className="text-base text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[140px]">
                        <DropdownMenuItem onClick={() => openEdit(role)}>
                          <Icon icon="solar:pen-2-line-duotone" className="mr-2 text-sm" />
                          <span className="text-xs">Chỉnh sửa</span>
                        </DropdownMenuItem>
                        {!role.isSystem && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(role.id)}>
                              <Icon icon="solar:trash-bin-2-line-duotone" className="mr-2 text-sm" />
                              <span className="text-xs">Xóa</span>
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-border">
              <span className="text-[11px] text-muted-foreground">
                Hiển thị {filteredRoles.length} / {roles.length} role
              </span>
            </div>
          </div>
        )}
      </AppDashed>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Chỉnh sửa role" : "Tạo role mới"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Tên role *</label>
                <Input
                  placeholder="editor, moderator..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={editingRole?.isSystem}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Mô tả</label>
                <Input
                  placeholder="Quản lý nội dung blog..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Quyền hạn</label>
                {editingRole?.isSystem ? (
                  <span className="text-[10px] text-amber-500 font-medium">Role hệ thống — không thể sửa quyền</span>
                ) : (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={handleToggleAll}>
                    Chọn tất cả / Bỏ chọn
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PERMISSION_GROUPS.map((group) => {
                  const allChecked = group.permissions.every((p) => form.permissions.includes(p.key));
                  const someChecked = group.permissions.some((p) => form.permissions.includes(p.key));
                  return (
                    <div key={group.module} className="rounded-lg border border-border p-3">
                      <div
                        className="flex items-center gap-2 mb-2 cursor-pointer select-none"
                        onClick={() => !editingRole?.isSystem && handleToggleModule(group.permissions)}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-colors ${allChecked ? "bg-primary border-primary text-primary-foreground" : someChecked ? "bg-primary/30 border-primary/50 text-primary-foreground" : "border-border"}`}>
                          {(allChecked || someChecked) && <Icon icon="solar:check-read-linear" />}
                        </div>
                        <Icon icon={group.icon} className="text-sm text-muted-foreground" />
                        <span className="text-xs font-semibold text-title">{group.module}</span>
                      </div>
                      <div className="flex flex-col gap-1 pl-6">
                        {group.permissions.map((perm) => (
                          <label key={perm.key} className="flex items-center gap-2 cursor-pointer select-none">
                            <div
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] transition-colors ${form.permissions.includes(perm.key) ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}
                              onClick={() => !editingRole?.isSystem && handleTogglePermission(perm.key)}
                            >
                              {form.permissions.includes(perm.key) && <Icon icon="solar:check-read-linear" />}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{perm.label}</span>
                            <span className="text-[9px] text-muted-foreground/50 ml-auto font-mono">{perm.key}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Hủy</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving && <Icon icon="svg-spinners:ring-resize" className="mr-1.5 text-sm" />}
                {editingRole ? "Cập nhật" : "Tạo role"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa role"
        description="Bạn có chắc muốn xóa role này? Người dùng đang sử dụng role sẽ bị hủy liên kết."
        confirmText="Xóa"
        onConfirm={handleDelete}
      />
    </div>
  );
}
