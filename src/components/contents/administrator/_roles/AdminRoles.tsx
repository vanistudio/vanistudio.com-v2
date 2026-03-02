import { useState, useEffect, useCallback } from "react";
import AppDashed from "@/components/layouts/application/AppDashed";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });
  const [saving, setSaving] = useState(false);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa role này?")) return;
    try {
      const { data } = await (api.api.admin as any).roles({ id }).delete();
      if (data?.success) { toast.success("Đã xóa role"); fetchRoles(); }
      else toast.error(data?.error || "Xóa thất bại");
    } catch {
      toast.error("Lỗi kết nối");
    }
  };

  return (
    <div className="flex flex-col w-full mx-auto max-w-[1200px]">
      <AppDashed noTopBorder padding="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon icon="solar:shield-keyhole-bold-duotone" className="text-xl text-primary" />
            <h1 className="text-lg font-bold text-title">Phân quyền</h1>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Icon icon="solar:add-circle-line-duotone" className="mr-1.5" />
            Tạo role
          </Button>
        </div>
      </AppDashed>

      <AppDashed noTopBorder padding="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Icon icon="svg-spinners:ring-resize" className="text-2xl text-muted-foreground" />
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Icon icon="solar:shield-keyhole-bold-duotone" className="text-4xl text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Chưa có role nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {roles.map((role) => (
              <div key={role.id} className="flex flex-col p-4 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon icon={role.permissions.includes("*") ? "solar:shield-star-bold-duotone" : "solar:shield-keyhole-bold-duotone"} className="text-lg text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-title">{role.name}</h3>
                      {role.description && <p className="text-[10px] text-muted-foreground">{role.description}</p>}
                    </div>
                  </div>
                  {role.isSystem && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">Hệ thống</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:users-group-rounded-line-duotone" className="text-xs" />
                    {role.userCount} người dùng
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:key-line-duotone" className="text-xs" />
                    {role.permissions.includes("*") ? "Toàn quyền" : `${role.permissions.length} quyền`}
                  </span>
                </div>
                {!role.permissions.includes("*") && role.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {role.permissions.slice(0, 6).map((p) => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{p}</span>
                    ))}
                    {role.permissions.length > 6 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60">+{role.permissions.length - 6}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => openEdit(role)}>
                    <Icon icon="solar:pen-2-line-duotone" className="mr-1 text-xs" />
                    Sửa
                  </Button>
                  {!role.isSystem && (
                    <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(role.id)}>
                      <Icon icon="solar:trash-bin-2-line-duotone" className="text-xs" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </AppDashed>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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
                  disabled={editingRole?.isSystem && editingRole?.name === "admin"}
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
                <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={handleToggleAll}>
                  Chọn tất cả / Bỏ chọn
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PERMISSION_GROUPS.map((group) => {
                  const allChecked = group.permissions.every((p) => form.permissions.includes(p.key));
                  const someChecked = group.permissions.some((p) => form.permissions.includes(p.key));
                  return (
                    <div key={group.module} className="rounded-lg border border-border p-3">
                      <div
                        className="flex items-center gap-2 mb-2 cursor-pointer select-none"
                        onClick={() => handleToggleModule(group.permissions)}
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
                              onClick={() => handleTogglePermission(perm.key)}
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
    </div>
  );
}
