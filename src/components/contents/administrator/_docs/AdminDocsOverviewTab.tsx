"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";
import { type ApiOverview } from "./types";

interface AdminDocsOverviewTabProps {
  apiType: string;
}

export default function AdminDocsOverviewTab({ apiType }: AdminDocsOverviewTabProps) {
  const router = useRouter();
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [overviewToDelete, setOverviewToDelete] = useState<ApiOverview | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query overviews
  const { data: overviews = [], isLoading, refetch, isFetching } =
    trpc.administrator.apiDocs.getOverviews.useQuery(
      { apiType },
      {
        refetchOnWindowFocus: false,
        enabled: !!apiType,
      }
    );

  const deleteMutation = trpc.administrator.apiDocs.deleteOverview.useMutation({
    onSuccess: () => {
      toast.success("Xóa tài liệu tổng quan thành công!");
      refetch();
      setOverviewToDelete(null);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi xóa tài liệu tổng quan");
    },
  });

  const handleCreateNew = () => {
    router.push(`/adminPanel/docs/overview/create?apiType=${apiType}`);
  };

  const handleEdit = (overview: ApiOverview) => {
    router.push(`/adminPanel/docs/overview/edit/${overview.id}`);
  };

  const confirmDelete = () => {
    if (overviewToDelete) {
      deleteMutation.mutate({ id: overviewToDelete.id });
    }
  };

  // Filter & Sort overviews
  const filteredOverviews = useMemo(() => {
    let result = [...overviews];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.slug.toLowerCase().includes(q) ||
          (o.description && o.description.toLowerCase().includes(q))
      );
    }

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a: any, b: any) => {
        const valA = a[id];
        const valB = b[id];
        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return desc ? valB - valA : valA - valB;
      });
    }

    return result;
  }, [overviews, debouncedSearch, sorting]);

  const paginatedOverviews = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredOverviews.slice(start, start + pagination.pageSize);
  }, [filteredOverviews, pagination]);

  const columns = useMemo<ColumnDef<ApiOverview>[]>(
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
        accessorKey: "title",
        meta: { title: "Tiêu đề tài liệu" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shadow-2xs shrink-0">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt={item.title} className="size-full object-cover" />
                ) : (
                  <Icon icon="solar:document-text-line-duotone" className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-[13px] font-bold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
                  onClick={() => handleEdit(item)}
                >
                  {item.title}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  slug: {item.slug}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "isActive",
        meta: { title: "Trạng thái" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const active = row.getValue("isActive") as boolean;
          return (
            <Badge
              variant="secondary"
              className={cn(
                "font-bold text-[10px] uppercase tracking-wider border",
                active
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
              )}
            >
              {active ? "Công khai" : "Bản nháp"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        meta: { title: "Ngày tạo" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="flex flex-col text-xs text-muted-foreground whitespace-nowrap leading-relaxed">
              <span className="font-semibold text-foreground">
                {formatWithSiteTimezone(date, "HH:mm, DD/MM/YYYY", siteTimezone)}
              </span>
              <span className="text-[10px] font-mono opacity-80">
                {formatWithSiteTimezone(date, "[GMT]Z", siteTimezone)}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1 flex flex-col gap-0.5" align="end">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2 cursor-pointer font-bold"
                  onClick={() => handleEdit(item)}
                >
                  <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2 cursor-pointer text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-bold"
                  onClick={() => setOverviewToDelete(item)}
                >
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
                  Xóa tài liệu
                </Button>
              </PopoverContent>
            </Popover>
          );
        },
      },
    ],
    [pagination, sorting, siteTimezone]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Tài liệu chung</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý các tài liệu hướng dẫn kỹ thuật chung cho Loại API hiện tại.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="vanixjnk" size="sm" className="gap-1.5 shrink-0 cursor-pointer font-bold">
                <Icon icon="solar:hamburger-menu-line-duotone" className="text-base" />
                <span>Thao tác</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1 flex flex-col gap-0.5" align="end">
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer font-bold"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <Icon
                  icon="solar:restart-line-duotone"
                  className={cn("mr-2 size-3.5 text-sky-500", isFetching && "animate-spin")}
                />
                Làm mới
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer font-bold"
                onClick={handleCreateNew}
                disabled={!apiType}
              >
                <Icon icon="solar:add-circle-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                Thêm tài liệu
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedOverviews}
        isLoading={isLoading}
        pageCount={Math.ceil(filteredOverviews.length / pagination.pageSize)}
        totalRecords={filteredOverviews.length}
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
                placeholder="Tìm kiếm tài liệu..."
                className="pl-9 h-9 text-[13px] w-full bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        }
      />

      {/* Custom Delete Dialog */}
      <Dialog open={!!overviewToDelete} onOpenChange={(open) => !open && setOverviewToDelete(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa tài liệu</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa tài liệu <strong className="text-foreground font-semibold">"{overviewToDelete?.title}"</strong> không? Hành động này không thể hoàn tác và tài liệu sẽ bị xóa hoàn toàn khỏi hệ thống.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setOverviewToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
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
