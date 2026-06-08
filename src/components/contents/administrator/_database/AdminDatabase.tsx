"use client";

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";


function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function AdminDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const sortField = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  const { data, isLoading, refetch, isFetching, error } = trpc.administrator.database.getStats.useQuery(
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
      toast.error(error.message || "Không thể tải dữ liệu thống kê database");
    }
  }, [error]);

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Đã làm mới thông tin database");
    } catch {
      toast.error("Có lỗi xảy ra khi tải lại thông tin database");
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
      accessorKey: "tableName",
      meta: { title: "Tên bảng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <span className="font-mono text-xs tracking-tight text-foreground flex items-center gap-2">
          <Icon icon="solar:widget-3-line-duotone" className="text-muted-foreground/75 text-base" />
          <span>{row.getValue("tableName")}</span>
        </span>
      ),
    },
    {
      accessorKey: "rowCount",
      meta: { title: "Số hàng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const val = Number(row.getValue("rowCount")) || 0;
        return <span className="font-mono text-xs">{val.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "totalSize",
      meta: { title: "Dung lượng" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const val = Number(row.getValue("totalSize")) || 0;
        return <span className="font-mono text-xs text-vanixjnk font-semibold">{formatBytes(val)}</span>;
      },
    },
  ], []);

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:database-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Database</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Theo dõi trạng thái, dung lượng lưu trữ và số lượng bản ghi của các bảng trong cơ sở dữ liệu.
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
          <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-b border-border/60 flex-1">
            <div className="lg:col-span-4 p-6 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col gap-4">
              <div className="pb-3">
                <h3 className="text-base font-bold text-foreground">Thống kê Database</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tổng quan dung lượng và số lượng bản ghi hiện tại.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số bảng</p>
                    <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        data?.data.stats.totalTables
                      )}
                    </h3>
                  </div>
                  <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                    <Icon icon="solar:list-down-minimalistic-line-duotone" className="text-xl" />
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng dung lượng</p>
                    <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                      {isLoading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        formatBytes(data?.data.stats.totalSize || 0)
                      )}
                    </h3>
                  </div>
                  <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <Icon icon="solar:server-square-line-duotone" className="text-xl" />
                  </div>
                </div>
                <div className="p-4 rounded-lg border bg-background/60 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số hàng</p>
                    <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        data?.data.stats.totalRows.toLocaleString()
                      )}
                    </h3>
                  </div>
                  <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                    <Icon icon="solar:documents-line-duotone" className="text-xl" />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 p-6 flex flex-col gap-4">
              <div className="pb-3 flex flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Danh sách bảng</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chi tiết các bảng dữ liệu trong schema public.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading || isFetching}
                    className="gap-1.5 shrink-0"
                  >
                    <Icon
                      icon="solar:restart-line-duotone"
                      className={cn("text-base", (isLoading || isFetching) && "animate-spin")}
                    />
                    <span>Làm mới</span>
                  </Button>
                </div>
              </div>
              <DataTable
                columns={columns}
                data={data?.data.items || []}
                isLoading={isLoading}
                searchPlaceholder="Tìm kiếm bảng theo tên..."
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
                      placeholder="Tìm kiếm bảng theo tên..."
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
    </div>
  );
}
