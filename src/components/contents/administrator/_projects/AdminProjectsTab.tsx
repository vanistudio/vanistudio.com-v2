"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "@bprogress/next/app";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import type { Project } from "@/server/db/schemas/project.schema";
import { QuickReorderProjectsDialog } from "./QuickReorderProjectsDialog";

export default function AdminProjectsTab() {
  const router = useRouter();

  const { data: projectsData, isLoading: projectsLoading, refetch: refetchProjects, isFetching: projectsFetching } =
    trpc.administrator.projects.getAll.useQuery(undefined, { refetchOnWindowFocus: false });

  const deleteProjectMutation = trpc.administrator.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Xóa dự án thành công!");
      refetchProjects();
    },
    onError: (err) => toast.error(err.message || "Xóa thất bại"),
  });

  const projectsList = projectsData || [];
  const [projectsSearch, setProjectsSearch] = useState("");
  const [projectsSorting, setProjectsSorting] = useState<SortingState>([]);
  const [projectsPagination, setProjectsPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    let result = [...projectsList];

    if (projectsSearch) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(projectsSearch.toLowerCase()) ||
          p.slug.toLowerCase().includes(projectsSearch.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(projectsSearch.toLowerCase()))
      );
    }

    if (projectsSorting.length > 0) {
      const { id, desc } = projectsSorting[0];
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
  }, [projectsList, projectsSearch, projectsSorting]);

  const paginatedProjects = useMemo(() => {
    const start = projectsPagination.pageIndex * projectsPagination.pageSize;
    const end = start + projectsPagination.pageSize;
    return filteredProjects.slice(start, end);
  }, [filteredProjects, projectsPagination]);

  const projectColumns = React.useMemo<ColumnDef<Project>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-normal">
          {projectsPagination.pageIndex * projectsPagination.pageSize + row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "thumbnail",
      meta: { title: "Thumbnail" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const thumb = row.getValue("thumbnail") as string;
        return (
          <div className="size-11 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shadow-2xs">
            {thumb ? (
              <img src={thumb} alt={row.original.name} className="size-full object-cover" />
            ) : (
              <Icon icon="solar:folder-open-line-duotone" className="size-5 text-muted-foreground" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      meta: { title: "Dự án" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span
            className="text-[13px] font-semibold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
            onClick={() => router.push(`/adminPanel/projects/edit/${row.original.id}`)}
          >
            {row.original.name}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            /{row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "projectType",
      meta: { title: "Phân loại" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const type = row.getValue("projectType") as string;
        return (
          <Badge variant="secondary" className="font-semibold text-[11px] capitalize">
            {type || "Chưa phân loại"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "role",
      meta: { title: "Vai trò" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => <span className="text-xs text-foreground font-medium">{row.original.role || "—"}</span>,
    },
    {
      accessorKey: "difficulty",
      meta: { title: "Độ khó" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const diffValue = row.getValue("difficulty");
        if (diffValue === undefined || diffValue === null) return <span className="text-xs text-muted-foreground">—</span>;
        
        const diff = Number(diffValue);
        const difficultyLabels: Record<number, { label: string; color: string }> = {
          1: { label: "Cực dễ", color: "text-emerald-500" },
          2: { label: "Dễ", color: "text-emerald-500" },
          3: { label: "Trung bình", color: "text-blue-500" },
          4: { label: "Khó", color: "text-amber-500" },
          5: { label: "Cực khó", color: "text-rose-500" },
        };
        
        const meta = difficultyLabels[diff] || { label: `Độ khó: ${diff}/5`, color: "text-muted-foreground" };
        return <span className={cn("text-xs font-semibold", meta.color)}>{meta.label}</span>;
      },
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: Record<string, "success" | "outline" | "danger" | "secondary"> = {
          "Hoàn thành": "success",
          "Đang phát triển": "secondary",
          "Bản nháp": "outline",
        };
        return <Badge variant={variants[status] || "outline"}>{status || "Chưa đặt"}</Badge>;
      },
    },
    {
      accessorKey: "order",
      meta: { title: "Thứ tự" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.order}</span>,
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
          <PopoverContent className="w-40 p-1 flex flex-col gap-0.5" align="end">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2"
              onClick={() => router.push(`/adminPanel/projects/edit/${row.original.id}`)}
            >
              <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
              Chỉnh sửa
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => {
                setProjectToDelete(row.original);
              }}
            >
              <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
              Xóa dự án
            </Button>
          </PopoverContent>
        </Popover>
      ),
    },
  ], [projectsPagination]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Danh mục dự án</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Danh sách các dự án showcase được hiển thị trên trang chủ và portfolio.
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
                onClick={() => refetchProjects()}
                disabled={projectsLoading || projectsFetching}
              >
                <Icon
                  icon="solar:restart-line-duotone"
                  className={cn("mr-2 size-3.5 text-sky-500", (projectsLoading || projectsFetching) && "animate-spin")}
                />
                Làm mới
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                onClick={() => router.push("/adminPanel/projects/create")}
              >
                <Icon icon="solar:add-circle-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                Tạo dự án mới
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                onClick={() => setSortDialogOpen(true)}
              >
                <Icon icon="solar:sort-vertical-line-duotone" className="mr-2 size-3.5 text-indigo-500" />
                Sắp xếp
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DataTable
        columns={projectColumns}
        data={paginatedProjects}
        isLoading={projectsLoading}
        pageCount={Math.ceil(filteredProjects.length / projectsPagination.pageSize)}
        totalRecords={filteredProjects.length}
        pagination={projectsPagination}
        onPaginationChange={setProjectsPagination}
        sorting={projectsSorting}
        onSortingChange={setProjectsSorting}
        toolbarInput={
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-line-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm kiếm dự án..."
              className="pl-9 h-9 w-full"
              value={projectsSearch}
              onChange={(e) => setProjectsSearch(e.target.value)}
            />
          </div>
        }
      />

      <QuickReorderProjectsDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        onSuccess={() => refetchProjects()}
      />

      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Icon icon="solar:danger-line-duotone" className="size-5" />
              Xác nhận xóa dự án
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa dự án <span className="font-bold text-foreground">"{projectToDelete?.name}"</span>?
            Hành động này không thể hoàn tác.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setProjectToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteProjectMutation.isPending}
              onClick={() => {
                if (projectToDelete) {
                  deleteProjectMutation.mutate({ id: projectToDelete.id });
                  setProjectToDelete(null);
                }
              }}
            >
              {deleteProjectMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
