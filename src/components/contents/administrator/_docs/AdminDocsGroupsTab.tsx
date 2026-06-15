"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { QuickReorderApiGroupsDialog } from "./QuickReorderApiGroupsDialog";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

interface AdminDocsGroupsTabProps {
  apiType: string;
}

interface GroupFormState {
  id?: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

export default function AdminDocsGroupsTab({ apiType }: AdminDocsGroupsTabProps) {
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<GroupFormState>({
    name: "",
    slug: "",
    description: "",
    order: 0,
  });

  const [groupToDelete, setGroupToDelete] = useState<any | null>(null);
  const [isSortDialogOpen, setIsSortDialogOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query groups
  const { data: groups = [], isLoading, refetch, isFetching } =
    trpc.administrator.apiDocs.getGroupsWithEndpoints.useQuery(
      { apiType },
      {
        refetchOnWindowFocus: false,
        enabled: !!apiType,
      }
    );

  const upsertMutation = trpc.administrator.apiDocs.upsertGroup.useMutation({
    onSuccess: () => {
      toast.success(formState.id ? "Cập nhật nhóm API thành công!" : "Tạo nhóm API thành công!");
      refetch();
      setIsFormOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi lưu thông tin nhóm API");
    },
  });

  const deleteMutation = trpc.administrator.apiDocs.deleteGroup.useMutation({
    onSuccess: () => {
      toast.success("Xóa nhóm API thành công!");
      refetch();
      setGroupToDelete(null);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi xóa nhóm API");
    },
  });

  const handleOpenCreate = () => {
    setFormState({
      name: "",
      slug: "",
      description: "",
      order: (groups.length > 0 ? Math.max(...groups.map((g: any) => g.order || 0)) + 10 : 10),
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (group: any) => {
    setFormState({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description || "",
      order: group.order || 0,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return toast.error("Tên nhóm không được để trống");
    if (!formState.slug.trim()) return toast.error("Slug nhóm không được để trống");

    upsertMutation.mutate({
      id: formState.id,
      apiType,
      name: formState.name,
      slug: formState.slug,
      description: formState.description || undefined,
      order: Number(formState.order),
    });
  };

  const confirmDelete = () => {
    if (groupToDelete) {
      deleteMutation.mutate({ id: groupToDelete.id });
    }
  };

  // Filter & Sort groups
  const filteredGroups = useMemo(() => {
    let result = [...groups];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (g: any) =>
          g.name.toLowerCase().includes(q) ||
          g.slug.toLowerCase().includes(q) ||
          (g.description && g.description.toLowerCase().includes(q))
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
    } else {
      // Default sorting by order
      result.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    }

    return result;
  }, [groups, debouncedSearch, sorting]);

  const paginatedGroups = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredGroups.slice(start, start + pagination.pageSize);
  }, [filteredGroups, pagination]);

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
        accessorKey: "name",
        meta: { title: "Tên nhóm API" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg flex items-center justify-center border border-border bg-muted/40 shrink-0 text-vanixjnk">
                <Icon icon="solar:folder-2-line-duotone" className="text-lg" />
              </div>
              <span
                className="text-[13px] font-semibold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
                onClick={() => handleOpenEdit(item)}
              >
                {item.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        meta: { title: "Mô tả" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground">
            {row.getValue("description") || "Chưa có mô tả"}
          </span>
        ),
      },
      {
        accessorKey: "slug",
        meta: { title: "Slug" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="font-mono text-xs text-muted-foreground">{item.slug}</span>
          );
        },
      },
      {
        accessorKey: "order",
        meta: { title: "Thứ tự sắp xếp" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.order ?? 0}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        meta: { title: "Ngày tạo" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const dateStr = row.getValue("createdAt") as string;
          return (
            <span className="text-xs font-mono text-muted-foreground">
              {formatWithSiteTimezone(dateStr, siteTimezone, "DD/MM/YYYY HH:mm")}
            </span>
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
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => handleOpenEdit(item)}
                >
                  <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                  onClick={() => setGroupToDelete(item)}
                >
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
                  Xóa nhóm
                </Button>
              </PopoverContent>
            </Popover>
          );
        },
      },
    ],
    [pagination, sorting]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Nhóm API</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Phân loại các API thành từng nhóm chức năng riêng biệt để dễ dàng theo dõi.
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
                onClick={handleOpenCreate}
                disabled={!apiType}
              >
                <Icon icon="solar:add-circle-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                Thêm nhóm API
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer font-bold"
                onClick={() => setIsSortDialogOpen(true)}
              >
                <Icon icon="solar:sort-vertical-line-duotone" className="mr-2 size-3.5 text-indigo-500" />
                Sắp xếp
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedGroups}
        isLoading={isLoading}
        pageCount={Math.ceil(filteredGroups.length / pagination.pageSize)}
        totalRecords={filteredGroups.length}
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
                placeholder="Tìm tên nhóm, slug..."
                className="pl-9 h-9 text-[13px] w-full bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        }
      />

      {/* Add/Edit Group Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-vanixjnk">
              <Icon icon="solar:folder-2-line-duotone" className="text-xl" />
              <span>{formState.id ? "Cập nhật nhóm API" : "Tạo nhóm API mới"}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Tên nhóm API</label>
              <Input
                placeholder="Ví dụ: Xác thực người dùng"
                className="h-9 text-[13px] bg-background"
                value={formState.name}
                onChange={(e) => {
                  const val = e.target.value;
                  const slug = val
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[đĐ]/g, "d")
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-");
                  setFormState((prev) => ({
                    ...prev,
                    name: val,
                    slug: prev.id ? prev.slug : slug,
                  }));
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Slug nhóm</label>
              <Input
                placeholder="Ví dụ: auth-endpoints"
                className="h-9 text-[13px] bg-background"
                value={formState.slug}
                onChange={(e) => setFormState((prev) => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground">Mô tả chi tiết</label>
              <Input
                placeholder="Mô tả công việc hoặc API thuộc nhóm này"
                className="h-9 text-[13px] bg-background"
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="vanixjnk"
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending && (
                  <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
                )}
                Lưu cấu hình
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Delete Dialog */}
      <Dialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa nhóm API</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa nhóm API <strong className="text-foreground font-semibold">"{groupToDelete?.name}"</strong> không? Hành động này sẽ xóa nhóm nhưng không xóa các endpoint trực thuộc (chúng sẽ được đưa về trạng thái "Chưa phân nhóm").
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setGroupToDelete(null)}>
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

      <QuickReorderApiGroupsDialog
        open={isSortDialogOpen}
        onOpenChange={setIsSortDialogOpen}
        apiType={apiType}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
