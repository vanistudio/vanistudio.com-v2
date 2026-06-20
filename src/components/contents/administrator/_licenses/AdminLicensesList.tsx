"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DateTimePicker } from "@/components/vanixjnk/date-time-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxSearchInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from "@/components/ui/combobox";
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

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

  const { data: productsData } = trpc.administrator.licenses.getProducts.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const productsList = productsData || [];

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any | null>(null);
  
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userComboOpen, setUserComboOpen] = useState(false);
  const { data: searchedUsers, isLoading: searchingUsers } = trpc.administrator.licenses.searchUsers.useQuery(
    { query: userSearch },
    { refetchOnWindowFocus: false }
  );

  const [productComboOpen, setProductComboOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [form, setForm] = useState({
    productId: "",
    licenseKey: "",
    status: "not_activated" as any,
    allowedDomains: [] as string[],
    domainInput: "",
    allowedIps: [] as string[],
    ipInput: "",
    maxActivations: 1,
    expiresAt: "",
  });

  const [licenseToDelete, setLicenseToDelete] = useState<any | null>(null);

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
    const segment = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    const generatedKey = `${segment()}-${segment()}-${segment()}-${segment()}`;
    setForm((prev) => ({ ...prev, licenseKey: generatedKey }));
  };

  const handleOpenEditor = (license: any | null = null) => {
    setUserSearch("");
    setProductSearch("");
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
        status: "not_activated",
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
        id: "allowedDomains",
        meta: { title: "Tên miền" },
        header: "Tên miền",
        cell: ({ row }) => {
          const domains = row.original.allowedDomains as string[];
          if (!domains || domains.length === 0) {
            return <span className="text-muted-foreground text-[11px] italic">Không giới hạn</span>;
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-[150px]">
              {domains.slice(0, 2).map((d, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-mono py-0 px-1 rounded-md shrink-0">
                  {d}
                </Badge>
              ))}
              {domains.length > 2 && (
                <span className="text-[9px] text-muted-foreground font-bold self-center">
                  +{domains.length - 2}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "allowedIps",
        meta: { title: "Địa chỉ IP" },
        header: "Địa chỉ IP",
        cell: ({ row }) => {
          const ips = row.original.allowedIps as string[];
          if (!ips || ips.length === 0) {
            return <span className="text-muted-foreground text-[11px] italic">Không giới hạn</span>;
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-[150px]">
              {ips.slice(0, 2).map((ip, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-mono py-0 px-1 rounded-md shrink-0">
                  {ip}
                </Badge>
              ))}
              {ips.length > 2 && (
                <span className="text-[9px] text-muted-foreground font-bold self-center">
                  +{ips.length - 2}
                </span>
              )}
            </div>
          );
        },
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
            activated: "success",
            not_activated: "secondary",
            suspended: "outline",
            expired: "danger",
            revoked: "danger",
          };
          const labels: Record<string, string> = {
            activated: "Đã kích hoạt",
            not_activated: "Chưa kích hoạt",
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

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="p-6 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Chưa kích hoạt</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.stats.notActivatedLicenses || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-muted-foreground bg-muted border border-border flex items-center justify-center shrink-0">
                <Icon icon="solar:shield-warning-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Đã kích hoạt</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.stats.activatedLicenses || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:shield-check-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tạm Khóa</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.stats.suspendedLicenses || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:lock-keyhole-line-duotone" className="text-xl" />
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Hết hạn</p>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                  {licensesLoading ? <Skeleton className="h-8 w-16" /> : licensesData?.data?.stats.expiredLicenses || 0}
                </h3>
              </div>
              <div className="size-10 rounded-lg text-rose-500 bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                <Icon icon="solar:clock-circle-line-duotone" className="text-xl" />
              </div>
            </div>
          </div>

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
                      className="pl-9 h-9 text-sm w-full"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "h-9 w-9",
                          (productFilter !== "all" || statusFilter !== "all") && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                        )}
                        title="Bộ lọc nâng cao"
                      >
                        <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 flex flex-col gap-3" align="end">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Sản phẩm
                        </label>
                        <Select value={productFilter} onValueChange={setProductFilter}>
                          <SelectTrigger className="w-full h-9 text-[13px] justify-between">
                            <SelectValue placeholder="Tất cả sản phẩm" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            <SelectItem value="all" className="text-[13px]">Tất cả sản phẩm</SelectItem>
                            {productsList.map((prod) => (
                              <SelectItem key={prod.id} value={prod.id} className="text-[13px]">
                                <span className="truncate max-w-[190px] block">{prod.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Trạng thái
                        </label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full h-9 text-[13px] justify-between">
                            <SelectValue placeholder="Mọi trạng thái" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            <SelectItem value="all" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:widget-3-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                                <span>Mọi trạng thái</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="not_activated" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:shield-warning-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                                <span>Chưa kích hoạt</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="activated" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:shield-check-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                                <span>Đã kích hoạt</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="suspended" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:lock-keyhole-line-duotone" className="size-3.5 shrink-0 text-orange-500" />
                                <span>Tạm khóa</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="expired" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:clock-circle-line-duotone" className="size-3.5 shrink-0 text-rose-500" />
                                <span>Hết hạn</span>
                              </span>
                            </SelectItem>
                            <SelectItem value="revoked" className="text-[13px]">
                              <span className="flex items-center gap-2">
                                <Icon icon="solar:slash-circle-line-duotone" className="size-3.5 shrink-0 text-red-500" />
                                <span>Đã hủy bỏ</span>
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              }
            />
          </div>
        </div>
      </div>

      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent className="sm:max-w-[550px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon="solar:verified-check-line-duotone" className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              {editingLicense ? "Chỉnh sửa bản quyền" : "Tạo bản quyền phần mềm mới"}
            </SheetTitle>
            <SheetDescription>
              Cấp phát khóa giấy phép bản quyền ứng dụng cho thành viên và cấu hình giới hạn kích hoạt.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground">Người sở hữu bản quyền</label>
              <Combobox open={userComboOpen} onOpenChange={setUserComboOpen}>
                <ComboboxTrigger className="w-full h-9 bg-background border-border text-xs justify-between" disabled={!!editingLicense}>
                  {selectedUser ? (
                    <span data-slot="combobox-value" className="text-left font-normal truncate">
                      {selectedUser.name} ({selectedUser.email})
                    </span>
                  ) : (
                    <span data-slot="combobox-value" className="text-muted-foreground text-left font-normal">
                      Chọn người sở hữu bản quyền...
                    </span>
                  )}
                </ComboboxTrigger>
                <ComboboxContent className="p-0 z-50 w-[var(--radix-popover-trigger-width)]" align="start">
                  <ComboboxSearchInput
                    placeholder="Tìm tên hoặc email..."
                    value={userSearch}
                    onValueChange={setUserSearch}
                  />
                  <ComboboxList className="max-h-48 overflow-y-auto">
                    {searchingUsers ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">Đang tìm kiếm...</div>
                    ) : searchedUsers && searchedUsers.length > 0 ? (
                      <ComboboxGroup>
                        {searchedUsers.map((user) => (
                          <ComboboxItem
                            key={user.id}
                            value={`${user.name} ${user.email}`}
                            data-checked={selectedUser?.id === user.id}
                            onSelect={() => {
                              setSelectedUser(user);
                              setUserComboOpen(false);
                            }}
                          >
                            <span className="font-semibold text-foreground text-xs">{user.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{user.email}</span>
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                    ) : (
                      <ComboboxEmpty className="p-3 text-center text-xs text-muted-foreground">
                        Không tìm thấy người dùng phù hợp
                      </ComboboxEmpty>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground">Sản phẩm cấp phép</label>
              <Combobox open={productComboOpen} onOpenChange={setProductComboOpen}>
                <ComboboxTrigger className="w-full h-9 bg-background border-border text-xs justify-between" disabled={!!editingLicense}>
                  {form.productId ? (
                    <span data-slot="combobox-value" className="text-left font-normal truncate">
                      {productsList.find((prod) => prod.id === form.productId)?.name || "Chọn sản phẩm"}
                    </span>
                  ) : (
                    <span data-slot="combobox-value" className="text-muted-foreground text-left font-normal">
                      Chọn sản phẩm...
                    </span>
                  )}
                </ComboboxTrigger>
                <ComboboxContent className="p-0 z-50 w-[var(--radix-popover-trigger-width)]" align="start">
                  <ComboboxSearchInput
                    placeholder="Tìm sản phẩm..."
                    value={productSearch}
                    onValueChange={setProductSearch}
                  />
                  <ComboboxList className="max-h-48 overflow-y-auto">
                    <ComboboxEmpty className="p-3 text-center text-xs text-muted-foreground">
                      Không tìm thấy sản phẩm phù hợp
                    </ComboboxEmpty>
                    {productsList.length > 0 && (
                      <ComboboxGroup>
                        {productsList.map((prod) => (
                          <ComboboxItem
                            key={prod.id}
                            value={prod.name}
                            data-checked={form.productId === prod.id}
                            onSelect={() => {
                              setForm((prev) => ({ ...prev, productId: prod.id }));
                              setProductComboOpen(false);
                            }}
                          >
                            <span className="text-xs text-foreground">{prod.name}</span>
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground">Mã License Key</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                  value={form.licenseKey}
                  onChange={(e) => setForm((prev) => ({ ...prev, licenseKey: e.target.value.toUpperCase() }))}
                  disabled={!!editingLicense}
                  className="h-9 text-xs font-mono"
                />
                {!editingLicense && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 cursor-pointer"
                    onClick={generateLicenseKey}
                    title="Tạo mã ngẫu nhiên"
                  >
                    <Icon icon="solar:shuffle-line-duotone" className="size-5 text-vanixjnk" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-foreground">Trạng thái bản quyền</label>
                <Select
                  value={form.status}
                  onValueChange={(val: any) => setForm((prev) => ({ ...prev, status: val }))}
                >
                  <SelectTrigger className="h-9 w-full bg-background border-border text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="not_activated" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:shield-warning-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                        <span>Chưa kích hoạt</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="activated" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:shield-check-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                        <span>Đã kích hoạt</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="suspended" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:lock-keyhole-line-duotone" className="size-3.5 shrink-0 text-orange-500" />
                        <span>Tạm khóa</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="expired" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:clock-circle-line-duotone" className="size-3.5 shrink-0 text-rose-500" />
                        <span>Hết hạn</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="revoked" className="text-[13px]">
                      <span className="flex items-center gap-2">
                        <Icon icon="solar:slash-circle-line-duotone" className="size-3.5 shrink-0 text-red-500" />
                        <span>Đã hủy bỏ</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-foreground">Giới hạn kích hoạt</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxActivations}
                  onChange={(e) => setForm((prev) => ({ ...prev, maxActivations: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground">Hạn dùng</label>
              <DateTimePicker
                value={form.expiresAt ? new Date(form.expiresAt) : null}
                onChange={(date) => setForm((prev) => ({ ...prev, expiresAt: date ? date.toISOString() : "" }))}
                placeholder="Chọn ngày và giờ hết hạn..."
                className="h-9 w-full bg-background text-xs"
                align="start"
              />
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 text-[11px] px-2.5 rounded-lg cursor-pointer gap-1",
                    !form.expiresAt && "border-vanixjnk text-vanixjnk bg-vanixjnk/5"
                  )}
                  onClick={() => setForm((prev) => ({ ...prev, expiresAt: "" }))}
                >
                  <Icon icon="solar:infinity-line-duotone" className="size-3.5" />
                  <span>Vĩnh viễn (Trọn đời)</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] px-2.5 rounded-lg cursor-pointer"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    setForm((prev) => ({ ...prev, expiresAt: d.toISOString() }));
                  }}
                >
                  30 ngày
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] px-2.5 rounded-lg cursor-pointer"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 90);
                    setForm((prev) => ({ ...prev, expiresAt: d.toISOString() }));
                  }}
                >
                  90 ngày
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] px-2.5 rounded-lg cursor-pointer"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 365);
                    setForm((prev) => ({ ...prev, expiresAt: d.toISOString() }));
                  }}
                >
                  365 ngày
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <label className="text-[13px] font-bold text-foreground">Giới hạn tên miền (Allowed Domains)</label>
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
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.allowedDomains.map((dom, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-[10px] font-mono py-1 px-2 rounded-lg">
                      <span>{dom}</span>
                      <button type="button" onClick={() => handleRemoveDomain(idx)} className="text-rose-500 hover:text-rose-600 size-3 rounded-full flex items-center justify-center shrink-0">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 border-t pt-4">
              <label className="text-[13px] font-bold text-foreground">Giới hạn IP (Allowed IPs)</label>
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
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.allowedIps.map((ip, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-[10px] font-mono py-1 px-2 rounded-lg">
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

          <div className="p-6 border-t border-border flex items-center gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setEditorOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="vanixjnk"
              className="flex-1 font-bold text-sm"
              onClick={saveLicense}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Icon icon="solar:restart-line-duotone" className="size-5 animate-spin mr-2" />
              ) : (
                <Icon icon="solar:check-circle-line-duotone" className="size-5 mr-2" />
              )}
              {editingLicense ? "Lưu thay đổi thiết lập" : "Kích hoạt bản quyền"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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
