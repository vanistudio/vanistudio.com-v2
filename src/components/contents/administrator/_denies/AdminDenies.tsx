"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimePicker } from "@/components/vanixjnk/date-time-picker";

function formatDateTime(dateStr: string | Date | null | undefined) {
  if (!dateStr) return "Vĩnh viễn";
  const date = new Date(dateStr);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminDenies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"add" | "edit">("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [expireType, setExpireType] = useState<"permanent" | "1day" | "7days" | "30days" | "custom">("permanent");
  const [customExpiresAt, setCustomExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  const { data, isLoading, refetch, isFetching, error } = trpc.administrator.denies.getStats.useQuery(
    {
      search: debouncedSearch,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortField,
      sortOrder,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Không thể tải danh sách chặn IP");
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Đã làm mới danh sách chặn IP");
    } catch {
      toast.error("Có lỗi xảy ra khi tải lại danh sách");
    }
  };

  const createMutation = trpc.administrator.denies.create.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setIsSheetOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Có lỗi xảy ra khi thêm IP chặn");
    },
  });

  const updateMutation = trpc.administrator.denies.update.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setIsSheetOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật thông tin chặn IP");
    },
  });

  const deleteMutation = trpc.administrator.denies.delete.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setIsDeleteOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Có lỗi xảy ra khi gỡ chặn IP");
    },
  });

  const handleOpenAdd = () => {
    setSheetMode("add");
    setSelectedId(null);
    setIp("");
    setReason("Vi phạm chính sách");
    setExpireType("permanent");
    setCustomExpiresAt(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setSheetMode("edit");
    setSelectedId(item.id);
    setIp(item.ip);
    setReason(item.reason || "Vi phạm chính sách");

    if (!item.expiresAt) {
      setExpireType("permanent");
      setCustomExpiresAt(null);
    } else {
      setExpireType("custom");
      setCustomExpiresAt(new Date(item.expiresAt));
    }

    setIsSheetOpen(true);
  };

  const handleOpenDelete = (item: any) => {
    setSelectedId(item.id);
    setIp(item.ip);
    setIsDeleteOpen(true);
  };

  const calculateExpiresAtDate = () => {
    if (expireType === "permanent") return null;
    const now = new Date();
    if (expireType === "1day") {
      now.setDate(now.getDate() + 1);
      return now.toISOString();
    }
    if (expireType === "7days") {
      now.setDate(now.getDate() + 7);
      return now.toISOString();
    }
    if (expireType === "30days") {
      now.setDate(now.getDate() + 30);
      return now.toISOString();
    }
    if (expireType === "custom" && customExpiresAt) {
      return customExpiresAt.toISOString();
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) {
      toast.error("Vui lòng nhập địa chỉ IP");
      return;
    }

    const calculatedExp = calculateExpiresAtDate();

    const payload = {
      ip: ip.trim(),
      reason: reason.trim() || "Vi phạm chính sách",
      expiresAt: calculatedExp,
    };

    if (sheetMode === "add") {
      createMutation.mutate(payload);
    } else if (selectedId) {
      updateMutation.mutate({
        id: selectedId,
        ...payload,
      });
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => {
        const page = data?.data.pagination.page || 1;
        const limit = data?.data.pagination.limit || 10;
        return (
          <span className="text-muted-foreground font-normal">
            {(page - 1) * limit + row.index + 1}
          </span>
        );
      },
    },
    {
      accessorKey: "ip",
      meta: { title: "Địa chỉ IP" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const ipVal = row.getValue("ip") as string;
        const countryVal = row.original.country;
        const cityVal = row.original.city;
        const ispVal = row.original.isp;

        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm tracking-tight text-foreground flex items-center gap-2 font-bold">
              <Icon icon="solar:shield-warning-line-duotone" className="text-rose-500 text-base shrink-0" />
              <span>{ipVal}</span>
            </span>
            {(countryVal || cityVal || ispVal) && (
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 pl-6">
                {countryVal && (
                  <span className="flex items-center gap-0.5 bg-muted/60 px-1 rounded">
                    <Icon icon="solar:global-line-duotone" className="size-3" />
                    {cityVal ? `${cityVal}, ` : ""}{countryVal}
                  </span>
                )}
                {ispVal && (
                  <span className="bg-muted/60 px-1 rounded italic max-w-[150px] truncate">
                    ISP: {ispVal}
                  </span>
                )}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      meta: { title: "Lý do chặn" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-xs text-foreground max-w-[280px] block truncate font-medium">
          {row.getValue("reason") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "whoBanned",
      meta: { title: "Người chặn" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="font-semibold text-xs bg-muted/70 px-2 py-0.5 rounded text-foreground flex items-center gap-1.5 w-fit">
          <Icon icon="solar:shield-user-line-duotone" className="text-muted-foreground" />
          <span>{row.getValue("whoBanned")}</span>
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Ngày chặn" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground">
          {formatDateTime(row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      accessorKey: "expiresAt",
      meta: { title: "Hết hạn" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const expiresVal = row.getValue("expiresAt");
        if (!expiresVal) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <Icon icon="solar:infinity-line-duotone" className="size-3" />
              Vĩnh viễn
            </span>
          );
        }

        const isExpired = new Date(expiresVal as string) < new Date();

        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
              isExpired
                ? "bg-muted text-muted-foreground border-border"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            )}
          >
            <Icon icon="solar:clock-square-line-duotone" className="size-3" />
            {formatDateTime(expiresVal as string)} {isExpired && "(Hết hạn)"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => handleOpenEdit(row.original)}
          >
            <Icon icon="solar:pen-line-duotone" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
            onClick={() => handleOpenDelete(row.original)}
          >
            <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [data]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-rose-500 bg-rose-500/10 border border-rose-500/25 shrink-0">
                <Icon icon="solar:shield-minus-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý IP Chặn</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Thiết lập danh sách địa chỉ IP bị chặn truy cập và định cấu hình thời gian hết hạn hoặc lý do vi phạm.
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
            backgroundImage: "repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 10px)"
          }}
        />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="p-6 border-b border-border/60 flex flex-col gap-6">
            
            {/* Hộp Thống kê ở trên */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số IP bị chặn</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : data?.data.stats.totalBanned}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-rose-500 bg-rose-500/10 border border-rose-500/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:shield-warning-line-duotone" className="text-xl" />
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Đang chặn</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : data?.data.stats.activeBanned}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-red-500 bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:shield-check-line-duotone" className="text-xl" />
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Chặn tạm thời</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : data?.data.stats.tempBanned}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:clock-circle-line-duotone" className="text-xl" />
                </div>
              </div>
            </div>

            {/* Khối danh sách chính */}
            <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
              <div className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Danh sách chặn hoạt động</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Danh sách các địa chỉ IP bị cấm kết nối tới máy chủ.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="vanixjnk" size="sm" className="gap-1.5 shrink-0 cursor-pointer">
                        <Icon icon="solar:hamburger-menu-line-duotone" className="text-base" />
                        <span>Thao tác</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-1 flex flex-col gap-0.5" align="end">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                        onClick={handleRefresh}
                        disabled={isLoading || isFetching}
                      >
                        <Icon
                          icon="solar:restart-line-duotone"
                          className={cn("mr-2 size-3.5 text-sky-500", (isLoading || isFetching) && "animate-spin")}
                        />
                        Làm mới
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                        onClick={handleOpenAdd}
                      >
                        <Icon icon="solar:shield-plus-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                        Thêm IP Chặn
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={data?.data.items || []}
                isLoading={isLoading}
                searchPlaceholder="Tìm kiếm theo IP, lý do..."
                pageCount={data?.data.pagination.totalPages}
                totalRecords={data?.data.pagination.total}
                pagination={pagination}
                onPaginationChange={setPagination}
                sorting={sorting}
                onSortingChange={setSorting}
                toolbarInput={
                  <div className="relative w-full">
                    <Icon
                      icon="solar:magnifer-line-duotone"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                    />
                    <Input
                      placeholder="Tìm kiếm theo IP, lý do hoặc người chặn..."
                      className="pl-9 h-9 text-sm w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                }
              />
            </div>

          </div>
        </div>
      </div>

      {/* Sheet Thêm / Sửa IP Chặn */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[550px] w-full p-0 flex flex-col">
          <SheetHeader className="p-6">
            <div className="size-10 rounded-xl bg-vanixjnk/10 text-vanixjnk flex items-center justify-center shrink-0 mb-2">
              <Icon icon={sheetMode === "add" ? "solar:shield-plus-line-duotone" : "solar:pen-line-duotone"} className="size-6" />
            </div>
            <SheetTitle className="text-xl font-bold">
              {sheetMode === "add" ? "Thêm IP vào danh sách chặn" : "Chỉnh sửa IP chặn"}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === "add" 
                ? "Nhập địa chỉ IP và cấu hình thời hạn, lý do chặn." 
                : "Cập nhật lại thông số cấu hình chặn cho địa chỉ IP."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 custom-scrollbar bg-background">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground">Địa chỉ IP</label>
              <Input
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="Nhập IPv4 (vd: 1.2.3.4) hoặc IPv6..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground">Lý do chặn</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Lý do chi tiết vi phạm chính sách..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-foreground">Thời hạn chặn</label>
              <Select
                value={expireType}
                onValueChange={(val: any) => setExpireType(val)}
              >
                <SelectTrigger className="w-full shadow-sm text-[13px]">
                  <SelectValue placeholder="Chọn thời hạn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Vĩnh viễn</SelectItem>
                  <SelectItem value="1day">1 Ngày</SelectItem>
                  <SelectItem value="7days">7 Ngày</SelectItem>
                  <SelectItem value="30days">30 Ngày</SelectItem>
                  <SelectItem value="custom">Tự chọn thời gian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {expireType === "custom" && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-[13px] font-bold text-foreground">Chọn ngày & giờ hết hạn</label>
                <DateTimePicker
                  value={customExpiresAt}
                  onChange={(date) => setCustomExpiresAt(date)}
                  minDate={new Date()}
                />
              </div>
            )}
          </div>

          <div className="p-6">
            <Button
              variant="vanixjnk"
              className="w-full font-bold text-sm"
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Icon icon="solar:restart-line-duotone" className="size-5 animate-spin mr-2" />
              ) : (
                <Icon icon="solar:check-circle-line-duotone" className="size-5 mr-2" />
              )}
              Lưu cấu hình
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận gỡ chặn IP</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn gỡ chặn địa chỉ IP <strong className="text-foreground font-semibold">{ip}</strong> không? IP này sẽ có thể truy cập lại vào hệ thống một cách bình thường.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={() => selectedId && deleteMutation.mutate({ id: selectedId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              Xác nhận gỡ chặn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
