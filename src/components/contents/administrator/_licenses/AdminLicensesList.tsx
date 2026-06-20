"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

export default function AdminLicensesList() {
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Query licenses list
  const {
    data: licensesData,
    isLoading: licensesLoading,
    refetch: refetchLicenses,
    isFetching: licensesFetching,
  } = trpc.administrator.licenses.getList.useQuery(
    {
      search,
      status: statusFilter,
      productId: productFilter,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortField: sorting.length > 0 ? sorting[0].id : undefined,
      sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined,
    },
    { refetchOnWindowFocus: false }
  );

  // Query products list for select options
  const { data: productsData } = trpc.administrator.licenses.getProducts.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const productsList = productsData || [];

  // Dialog State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any | null>(null);
  
  // User Search State
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const { data: searchedUsers, isLoading: searchingUsers } = trpc.administrator.licenses.searchUsers.useQuery(
    { query: userSearch },
    { enabled: userSearch.trim().length > 0 }
  );

  // Form State
  const [form, setForm] = useState({
    productId: "",
    licenseKey: "",
    status: "active" as any,
    allowedDomains: [] as string[],
    domainInput: "",
    allowedIps: [] as string[],
    ipInput: "",
    maxActivations: 1,
    expiresAt: "",
  });

  const [licenseToDelete, setLicenseToDelete] = useState<any | null>(null);

  // Mutations
  const createMutation = trpc.administrator.licenses.create.useMutation({
    onSuccess: () => {
      toast.success("Tạo mã bản quyền thành công!");
      setEditorOpen(false);
      refetchLicenses();
    },
    onError: (err) => toast.error(err.message || "Tạo thất bại"),
  });

  const updateMutation = trpc.administrator.licenses.update.useMutation({
    onSuccess: () => {
      toast.success("Cập nhật bản quyền thành công!");
      setEditorOpen(false);
      refetchLicenses();
    },
    onError: (err) => toast.error(err.message || "Cập nhật thất bại"),
  });

  const deleteMutation = trpc.administrator.licenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Xóa bản quyền thành công!");
      refetchLicenses();
    },
    onError: (err) => toast.error(err.message || "Xóa thất bại"),
  });

  const generateLicenseKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const generatedKey = `VANI-${segment()}-${segment()}-${segment()}`;
    setForm((prev) => ({ ...prev, licenseKey: generatedKey }));
  };

  const handleOpenEditor = (license: any | null = null) => {
    setUserSearch("");
    if (license) {
      setEditingLicense(license);
      setSelectedUser(license.user);
      setForm({
        productId: license.productId,
        licenseKey: license.licenseKey,
        status: license.status,
        allowedDomains: license.allowedDomains || [],
        domainInput: "",
        allowedIps: license.allowedIps || [],
        ipInput: "",
        maxActivations: license.maxActivations,
        expiresAt: license.expiresAt ? new Date(license.expiresAt).toISOString().split("T")[0] : "",
      });
    } else {
      setEditingLicense(null);
      setSelectedUser(null);
      setForm({
        productId: productsList[0]?.id || "",
        licenseKey: "",
        status: "active",
        allowedDomains: [],
        domainInput: "",
        allowedIps: [],
        ipInput: "",
        maxActivations: 1,
        expiresAt: "",
      });
    }
    setEditorOpen(true);
  };

  const handleAddDomain = () => {
    const domain = form.domainInput.trim().toLowerCase();
    if (!domain) return;
    if (form.allowedDomains.includes(domain)) {
      return toast.error("Domain này đã tồn tại trong danh sách");
    }
    setForm((prev) => ({
      ...prev,
      allowedDomains: [...prev.allowedDomains, domain],
      domainInput: "",
    }));
  };

  const handleRemoveDomain = (index: number) => {
    setForm((prev) => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddIp = () => {
    const ip = form.ipInput.trim();
    if (!ip) return;
    if (form.allowedIps.includes(ip)) {
      return toast.error("IP này đã tồn tại trong danh sách");
    }
    setForm((prev) => ({
      ...prev,
      allowedIps: [...prev.allowedIps, ip],
      ipInput: "",
    }));
  };

  const handleRemoveIp = (index: number) => {
    setForm((prev) => ({
      ...prev,
      allowedIps: prev.allowedIps.filter((_, idx) => idx !== index),
    }));
  };

  const saveLicense = () => {
    if (!selectedUser) return toast.error("Vui lòng chọn người sở hữu bản quyền");
    if (!form.productId) return toast.error("Vui lòng chọn sản phẩm");
    if (!form.licenseKey.trim()) return toast.error("Mã bản quyền không được để trống");

    const payload = {
      userId: selectedUser.id,
      productId: form.productId,
      licenseKey: form.licenseKey,
      status: form.status,
      allowedDomains: form.allowedDomains,
      allowedIps: form.allowedIps,
      maxActivations: form.maxActivations,
      expiresAt: form.expiresAt || null,
    };

    if (editingLicense) {
      updateMutation.mutate({
        id: editingLicense.id,
        data: {
          status: form.status,
          allowedDomains: form.allowedDomains,
          allowedIps: form.allowedIps,
          maxActivations: form.maxActivations,
          expiresAt: form.expiresAt || null,
        },
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => (
          <span className="text-muted-foreground font-normal">
            {pagination.pageIndex * pagination.pageSize + row.index + 1}
          </span>
        ),
      },
      {
        accessorKey: "licenseKey",
        meta: { title: "Mã bản quyền" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[13px] font-mono font-bold text-foreground hover:text-vanixjnk transition-colors cursor-pointer select-all"
              onClick={() => handleOpenEditor(row.original)}
            >
              {row.original.licenseKey}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {row.original.product?.name}
            </span>
          </div>
        ),
      },
      {
        id: "user",
        meta: { title: "Khách hàng" },
        header: "Người sở hữu",
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-foreground">{row.original.user?.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{row.original.user?.email}</span>
          </div>
        ),
      },
      {
        id: "activations",
        header: "Giới hạn thiết bị",
        cell: ({ row }) => (
          <span className="text-xs font-mono">
            {row.original.activationCount} / {row.original.maxActivations}
          </span>
        ),
      },
      {
        accessorKey: "status",
        meta: { title: "Trạng thái" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const variants: Record<string, "success" | "outline" | "danger" | "secondary"> = {
            active: "success",
            suspended: "outline",
            expired: "danger",
            revoked: "danger",
          };
          const labels: Record<string, string> = {
            active: "Kích hoạt",
            suspended: "Tạm khóa",
            expired: "Hết hạn",
            revoked: "Đã hủy bỏ",
          };
          return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
        },
      },
      {
        accessorKey: "expiresAt",
        meta: { title: "Hạn dùng" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const date = row.getValue("expiresAt");
          return (
            <span className="text-xs font-mono text-muted-foreground">
              {date ? formatWithSiteTimezone(date as string, siteTimezone, "DD/MM/YYYY") : "Trọn đời"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        meta: { title: "Ngày tạo" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {formatWithSiteTimezone(row.original.createdAt, siteTimezone, "DD/MM/YYYY")}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1 flex flex-col gap-0.5" align="end">
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2"
                onClick={() => handleOpenEditor(row.original)}
              >
                <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
                Chỉnh sửa
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                onClick={() => setLicenseToDelete(row.original)}
              >
                <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
                Xóa bản quyền
              </Button>
            </PopoverContent>
          </Popover>
        ),
      },
    ],
    [pagination, siteTimezone]
  );

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Header Area */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:verified-check-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Bản quyền</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Cấp phát và quản lý mã bản quyền (license key) cho các ứng dụng, công cụ, hoặc bot của Vani Studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Stripe */}
      <div
        className="relative w-full border-t border-b border-dashed border-primary/20 overflow-hidden text-primary/20"
        style={{ height: "36px" }}
      >
        <div
          className="absolute inset-y-0 left-[-100vw] w-[300vw]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)",
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          {/* Stats Bar */}
          <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số License</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.pagination.total || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-indigo-500 bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:bill-list-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">License Hoạt động</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.stats.activeLicenses || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:shield-check-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">License Hết hạn</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.stats.expiredLicenses || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-rose-500 bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:clock-circle-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">License Tạm Khóa</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.stats.suspendedLicenses || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:shield-warning-line-duotone" className="text-xl" />
              </div>
            </div>
          </div>

          {/* Actions Toolbar */}
          <div className="px-6 py-4 flex flex-row items-center justify-between border-b border-border/60">
            <h3 className="text-base font-bold text-foreground">Danh mục Bản quyền</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchLicenses()}
                disabled={licensesLoading || licensesFetching}
                className="gap-1.5 shrink-0"
              >
                <Icon icon="solar:restart-line-duotone" className={cn("text-base", (licensesLoading || licensesFetching) && "animate-spin")} />
                <span>Làm mới</span>
              </Button>
              <Button variant="vanixjnk" size="sm" className="gap-1.5 shrink-0 cursor-pointer" onClick={() => handleOpenEditor(null)}>
                <Icon icon="solar:add-circle-line-duotone" className="text-base" />
                <span>Tạo bản quyền mới</span>
              </Button>
            </div>
          </div>

          {/* List and Table */}
          <div className="p-6 space-y-6 flex-1">
            <DataTable
              columns={columns}
              data={licensesData?.data?.items || []}
              isLoading={licensesLoading}
              pageCount={licensesData?.data?.pagination.totalPages || 0}
              totalRecords={licensesData?.data?.pagination.total || 0}
              pagination={pagination}
              onPaginationChange={setPagination}
              sorting={sorting}
              onSortingChange={setSorting}
              toolbarInput={
                <div className="flex items-center gap-2 w-full">
                  <div className="relative flex-1">
                    <Icon icon="solar:magnifer-line-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                    <Input
                      placeholder="Tìm kiếm key, người dùng, sản phẩm..."
                      className="pl-9 h-9 text-sm w-full bg-background"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Product Filter */}
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger className="h-9 w-44 bg-background border-border text-xs">
                      <SelectValue placeholder="Tất cả sản phẩm" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                      <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                      {productsList.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-36 bg-background border-border text-xs">
                      <SelectValue placeholder="Mọi trạng thái" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                      <SelectItem value="all">Mọi trạng thái</SelectItem>
                      <SelectItem value="active">Kích hoạt</SelectItem>
                      <SelectItem value="suspended">Tạm khóa</SelectItem>
                      <SelectItem value="expired">Hết hạn</SelectItem>
                      <SelectItem value="revoked">Đã hủy bỏ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon icon="solar:verified-check-line-duotone" className="text-xl text-vanixjnk" />
              <span>{editingLicense ? "Chỉnh sửa bản quyền" : "Tạo bản quyền phần mềm mới"}</span>
            </DialogTitle>
            <DialogDescription>
              Cấp phát khóa giấy phép bản quyền ứng dụng cho thành viên và cấu hình giới hạn kích hoạt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* User Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Người sở hữu bản quyền</label>
              {selectedUser ? (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{selectedUser.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{selectedUser.email}</p>
                  </div>
                  {!editingLicense && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => setSelectedUser(null)}>
                      Thay đổi
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Nhập tên hoặc email người dùng để tìm kiếm..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="h-9 text-xs"
                  />
                  {userSearch.trim().length > 0 && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto divide-y bg-background text-xs">
                      {searchingUsers ? (
                        <div className="p-3 text-center text-muted-foreground">Đang tìm kiếm...</div>
                      ) : searchedUsers && searchedUsers.length > 0 ? (
                        searchedUsers.map((user) => (
                          <div
                            key={user.id}
                            className="p-2.5 hover:bg-muted cursor-pointer flex flex-col gap-0.5 transition-colors"
                            onClick={() => setSelectedUser(user)}
                          >
                            <span className="font-semibold text-foreground">{user.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{user.email}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-muted-foreground">Không tìm thấy người dùng phù hợp</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Sản phẩm cấp phép</label>
              <Select
                value={form.productId}
                onValueChange={(val) => setForm((prev) => ({ ...prev, productId: val }))}
                disabled={!!editingLicense}
              >
                <SelectTrigger className="h-9 w-full bg-background border-border text-xs">
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {productsList.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* License Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Mã License Key</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="VANI-XXXX-XXXX-XXXX"
                  value={form.licenseKey}
                  onChange={(e) => setForm((prev) => ({ ...prev, licenseKey: e.target.value.toUpperCase() }))}
                  disabled={!!editingLicense}
                  className="h-9 text-xs font-mono"
                />
                {!editingLicense && (
                  <Button variant="outline" size="sm" className="h-9 text-xs gap-1 cursor-pointer shrink-0" onClick={generateLicenseKey}>
                    <Icon icon="solar:magic-stick-line-duotone" className="text-sm text-vanixjnk" />
                    Tạo mã ngẫu nhiên
                  </Button>
                )}
              </div>
            </div>

            {/* Status and Max activations */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Trạng thái bản quyền</label>
                <Select
                  value={form.status}
                  onValueChange={(val: any) => setForm((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className="h-9 w-full bg-background border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="active">Kích hoạt</SelectItem>
                    <SelectItem value="suspended">Tạm khóa</SelectItem>
                    <SelectItem value="expired">Hết hạn</SelectItem>
                    <SelectItem value="revoked">Hủy bỏ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Giới hạn kích hoạt tối đa</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxActivations}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxActivations: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Hạn dùng (để trống nếu trọn đời)</label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                className="h-9 text-xs font-mono"
              />
            </div>

            {/* Allowed Domains */}
            <div className="space-y-2 border-t pt-3">
              <label className="text-xs font-bold text-foreground">Giới hạn tên miền (Allowed Domains)</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nhập domain (ví dụ: localhost, client.com)..."
                  value={form.domainInput}
                  onChange={(e) => setForm((prev) => ({ ...prev, domainInput: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDomain())}
                  className="h-9 text-xs"
                />
                <Button variant="outline" size="sm" className="h-9 text-xs cursor-pointer shrink-0" onClick={handleAddDomain}>
                  Thêm
                </Button>
              </div>
              {form.allowedDomains.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {form.allowedDomains.map((dom, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-[10px] font-mono">
                      <span>{dom}</span>
                      <button type="button" onClick={() => handleRemoveDomain(idx)} className="text-rose-500 hover:text-rose-600 size-3 rounded-full flex items-center justify-center shrink-0">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Allowed IPs */}
            <div className="space-y-2 border-t pt-3">
              <label className="text-xs font-bold text-foreground">Giới hạn IP (Allowed IPs)</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nhập IP (ví dụ: 127.0.0.1, 103.82.20.1)..."
                  value={form.ipInput}
                  onChange={(e) => setForm((prev) => ({ ...prev, ipInput: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIp())}
                  className="h-9 text-xs"
                />
                <Button variant="outline" size="sm" className="h-9 text-xs cursor-pointer shrink-0" onClick={handleAddIp}>
                  Thêm
                </Button>
              </div>
              {form.allowedIps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {form.allowedIps.map((ip, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-[10px] font-mono">
                      <span>{ip}</span>
                      <button type="button" onClick={() => handleRemoveIp(idx)} className="text-rose-500 hover:text-rose-600 size-3 rounded-full flex items-center justify-center shrink-0">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-dashed">
            <Button variant="outline" size="sm" onClick={() => setEditorOpen(false)}>Hủy</Button>
            <Button
              variant="vanixjnk"
              size="sm"
              onClick={saveLicense}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              <span>{editingLicense ? "Lưu thay đổi" : "Kích hoạt bản quyền"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!licenseToDelete} onOpenChange={(open) => !open && setLicenseToDelete(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa bản quyền</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Hành động này sẽ xóa vĩnh viễn khóa bản quyền <strong className="text-foreground font-mono select-all">"{licenseToDelete?.licenseKey}"</strong> và chấm dứt quyền sử dụng của khách hàng. Hành động này không thể hoàn tác.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setLicenseToDelete(null)}>Hủy</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (licenseToDelete) {
                  deleteMutation.mutate({ id: licenseToDelete.id });
                  setLicenseToDelete(null);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
