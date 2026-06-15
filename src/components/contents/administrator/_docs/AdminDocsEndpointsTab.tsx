"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";
import { type ApiEndpoint } from "./types";
import PlaygroundSheet from "./PlaygroundSheet";

interface AdminDocsEndpointsTabProps {
  apiType: string;
}

export default function AdminDocsEndpointsTab({ apiType }: AdminDocsEndpointsTabProps) {
  const router = useRouter();
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("ALL");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  const [endpointToDelete, setEndpointToDelete] = useState<ApiEndpoint | null>(null);
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<ApiEndpoint | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: groups = [], isLoading, refetch, isFetching } =
    trpc.administrator.apiDocs.getGroupsWithEndpoints.useQuery(
      { apiType },
      {
        refetchOnWindowFocus: false,
        enabled: !!apiType,
      }
    );

  const endpoints = useMemo(() => {
    return groups.flatMap((g: any) =>
      g.endpoints.map((ep: any) => ({
        ...ep,
        groupName: g.name,
      }))
    );
  }, [groups]);

  const deleteMutation = trpc.administrator.apiDocs.deleteEndpoint.useMutation({
    onSuccess: () => {
      toast.success("Xóa endpoint thành công!");
      refetch();
      setEndpointToDelete(null);
    },
    onError: (err) => {
      toast.error(err.message || "Lỗi khi xóa endpoint");
    },
  });

  const handleCreateNew = () => {
    router.push(`/adminPanel/docs/endpoint/create?apiType=${apiType}`);
  };

  const handleEdit = (endpoint: ApiEndpoint) => {
    router.push(`/adminPanel/docs/endpoint/edit/${endpoint.id}`);
  };

  const confirmDelete = () => {
    if (endpointToDelete) {
      deleteMutation.mutate({ id: endpointToDelete.id });
    }
  };

  const getMethodBadgeClass = (method: string) => {
    const m = method.toUpperCase();
    if (m === "GET") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (m === "POST") return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    if (m === "PUT") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (m === "DELETE") return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    if (m === "PATCH") return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
    return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  };

  const filteredEndpoints = useMemo(() => {
    let result = [...endpoints];

    if (selectedGroupId && selectedGroupId !== "ALL") {
      result = result.filter((e) => e.groupId === selectedGroupId);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.path.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q))
      );
    }

    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      result.sort((a: any, b: any) => {
        let valA = a[id];
        let valB = b[id];

        if (id === "groupName") {
          valA = a.groupName || "";
          valB = b.groupName || "";
        }

        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === "string" && typeof valB === "string") {
          return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return desc ? valB - valA : valA - valB;
      });
    }

    return result;
  }, [endpoints, debouncedSearch, selectedGroupId, sorting]);

  const paginatedEndpoints = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredEndpoints.slice(start, start + pagination.pageSize);
  }, [filteredEndpoints, pagination]);

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
        meta: { title: "API Endpoint" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col gap-1 max-w-[320px] md:max-w-[400px]">
              <span
                className="text-[13px] font-bold text-foreground hover:text-vanixjnk transition-colors cursor-pointer line-clamp-1"
                onClick={() => handleEdit(item)}
              >
                {item.name}
              </span>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 border uppercase",
                    getMethodBadgeClass(item.method)
                  )}
                >
                  {item.method}
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground truncate" title={item.path}>
                  {item.path}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "groupName",
        meta: { title: "Nhóm API" },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Badge variant="outline" className="font-semibold text-xs border border-border bg-muted/40">
              {item.groupName || "Chưa phân nhóm"}
            </Badge>
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
              {active ? "Hoạt động" : "Bản nháp"}
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
                  onClick={() => setPlaygroundEndpoint(item)}
                >
                  <Icon icon="solar:play-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                  Chạy thử (Play)
                </Button>
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
                  onClick={() => setEndpointToDelete(item)}
                >
                  <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
                  Xóa Endpoint
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
          <h3 className="text-base font-bold text-foreground">API Endpoints</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý các điểm kết nối API nghiệp vụ, tham số đầu vào và mẫu phản hồi.
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
                Thêm Endpoint
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedEndpoints}
        isLoading={isLoading}
        pageCount={Math.ceil(filteredEndpoints.length / pagination.pageSize)}
        totalRecords={filteredEndpoints.length}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        toolbarInput={
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <div className="relative flex-1 w-full">
              <Icon
                icon="solar:magnifer-line-duotone"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm"
              />
              <Input
                placeholder="Tìm tên API, path..."
                className="pl-9 h-9 text-[13px] w-full bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="w-full sm:w-48 bg-background border-border text-[13px] h-9">
                <SelectValue placeholder="Lọc nhóm API..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs font-semibold">Tất cả nhóm API</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id} className="text-xs font-semibold">
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <Dialog open={!!endpointToDelete} onOpenChange={(open) => !open && setEndpointToDelete(null)}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa Endpoint</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa API Endpoint <strong className="text-foreground font-semibold">"{endpointToDelete?.name}"</strong> không? Hành động này không thể hoàn tác và các dữ liệu liên quan sẽ bị xóa vĩnh viễn.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setEndpointToDelete(null)}>
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

      {/* Playground Drawer */}
      {playgroundEndpoint && (
        <PlaygroundSheet
          isOpen={!!playgroundEndpoint}
          onClose={() => setPlaygroundEndpoint(null)}
          endpoint={playgroundEndpoint}
        />
      )}
    </div>
  );
}
