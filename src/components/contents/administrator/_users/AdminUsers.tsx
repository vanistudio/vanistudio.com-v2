"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
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
import { Badge } from "@/components/ui/badge";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";


export default function AdminUsers() {
  const router = useRouter();
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  const { data, isLoading, refetch, isFetching, error } = trpc.administrator.users.getStats.useQuery(
    {
      search: debouncedSearch,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortField,
      sortOrder,
      role: roleFilter,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Không thể tải danh sách người dùng");
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Đã làm mới danh sách người dùng");
    } catch {
      toast.error("Có lỗi xảy ra khi tải lại danh sách");
    }
  };

  const deleteMutation = trpc.administrator.users.delete.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setIsDeleteOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Có lỗi xảy ra khi xóa người dùng");
    },
  });

  const handleOpenDelete = (item: any) => {
    setSelectedId(item.id);
    setName(item.name || "");
    setIsDeleteOpen(true);
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
      accessorKey: "name",
      meta: { title: "Người dùng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const nameVal = row.getValue("name") as string;
        const emailVal = row.original.email as string;
        const usernameVal = row.original.username as string;
        const imageVal = row.original.image as string;

        return (
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
              {imageVal ? (
                <img src={imageVal} alt={nameVal} className="size-full object-cover" />
              ) : (
                <Icon icon="solar:user-line-duotone" className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-[13px] font-bold text-foreground truncate">{nameVal}</span>
              <span className="text-[10px] text-muted-foreground truncate font-mono">
                {usernameVal ? `@${usernameVal}` : ""} • {emailVal}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      meta: { title: "Vai trò" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const roleVal = row.getValue("role") as string;
        const isAdmin = roleVal === "admin";
        return (
          <Badge variant={isAdmin ? "default" : "secondary"} className="capitalize font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-md">
            <Icon icon={isAdmin ? "solar:shield-keyhole-line-duotone" : "solar:user-line-duotone"} className="size-3 mr-1" />
            {roleVal}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const isBanned = row.getValue("banned") as boolean;
        return (
          <Badge variant={isBanned ? "destructive" : "success"} className="font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-md">
            <Icon
              icon={isBanned ? "solar:slash-circle-line-duotone" : "solar:check-circle-line-duotone"}
              className="size-3 mr-1"
            />
            {isBanned ? "Bị khóa" : "Hoạt động"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banReason",
      meta: { title: "Lý do khóa" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground max-w-[200px] block truncate font-medium">
          {row.getValue("banReason") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Ngày tham gia" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const val = row.getValue("createdAt");
        return (
          <span className="text-xs font-medium text-muted-foreground">
            {val ? formatWithSiteTimezone(val as string, siteTimezone, "DD/MM/YYYY HH:mm:ss") : "—"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1 flex flex-col gap-0.5" align="end">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-vanixjnk hover:text-vanixjnk hover:bg-vanixjnk/10 cursor-pointer"
              onClick={() => router.push(`/adminPanel/users/edit/${row.original.id}`)}
            >
              <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
              Chỉnh sửa
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              onClick={() => handleOpenDelete(row.original)}
            >
              <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
              Xóa thành viên
            </Button>
          </PopoverContent>
        </Popover>
      ),
    },
  ], [data, router, siteTimezone]);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:users-group-two-rounded-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Thành viên</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Xem danh sách thành viên, cập nhật vai trò, khóa hoặc gỡ khóa tài khoản người dùng trên hệ thống.
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

      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col">
          <div className="p-6 border-b border-border/60 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số thành viên</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : data?.data.stats.totalUsers}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:users-group-two-rounded-line-duotone" className="text-xl" />
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tài khoản hoạt động</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : data?.data.stats.activeUsers}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-green-500 bg-green-500/10 border border-green-500/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:shield-check-line-duotone" className="text-xl" />
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tài khoản Quản trị</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : data?.data.stats.admins}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:shield-keyhole-line-duotone" className="text-xl" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
              <div className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Danh sách thành viên</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Quản lý thông tin phân quyền và trạng thái hoạt động của các thành viên.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0 cursor-pointer"
                    onClick={handleRefresh}
                    disabled={isLoading || isFetching}
                  >
                    <Icon
                      icon="solar:restart-line-duotone"
                      className={cn("size-4 text-sky-500", (isLoading || isFetching) && "animate-spin")}
                    />
                    <span>Làm mới</span>
                  </Button>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={data?.data.items || []}
                isLoading={isLoading}
                searchPlaceholder="Tìm kiếm thành viên..."
                pageCount={data?.data.pagination.totalPages}
                totalRecords={data?.data.pagination.total}
                pagination={pagination}
                onPaginationChange={setPagination}
                sorting={sorting}
                onSortingChange={setSorting}
                toolbarInput={
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1">
                      <Icon
                        icon="solar:magnifer-line-duotone"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
                      />
                      <Input
                        placeholder="Tìm kiếm theo tên, username, email, lý do..."
                        className="pl-9 h-9 text-sm w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-9 w-9 border-border bg-background hover:bg-muted/50 shrink-0",
                            roleFilter !== "all" && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                          )}
                          title="Lọc vai trò"
                        >
                          <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-3 flex flex-col gap-2" align="end">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            Vai trò
                          </label>
                          <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
                            <SelectTrigger className="w-full h-9 text-[13px] justify-between bg-background border-border">
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                              <SelectItem value="all" className="text-[13px]">
                                <span className="flex items-center gap-2">
                                  <Icon icon="solar:widget-3-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                                  <span>Tất cả</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="admin" className="text-[13px]">
                                <span className="flex items-center gap-2">
                                  <Icon icon="solar:shield-keyhole-line-duotone" className="size-3.5 shrink-0 text-amber-500" />
                                  <span>Admin</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="user" className="text-[13px]">
                                <span className="flex items-center gap-2">
                                  <Icon icon="solar:user-line-duotone" className="size-3.5 shrink-0 text-gray-500" />
                                  <span>User</span>
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
      </div>



      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa thành viên</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground text-left">
            Bạn có chắc chắn muốn xóa tài khoản của thành viên <strong className="text-foreground font-semibold">{name}</strong> không? Hành động này sẽ xóa vĩnh viễn tài khoản cùng tất cả các phiên đăng nhập liên quan.
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
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
