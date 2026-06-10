"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { GalleryDialog } from "@/components/vanixjnk/gallery-dialog";
import { cn } from "@/lib/utils";
import { CmsPageMock, getStoredPages, saveStoredPages } from "./types";

export default function CmsPageList() {
  const router = useRouter();
  const [pages, setPages] = useState<CmsPageMock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<CmsPageMock | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState<CmsPageMock | null>(null);

  useEffect(() => {
    setPages(getStoredPages());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateNew = () => {
    router.push("/adminPanel/cms/create");
  };

  const handleEdit = (page: CmsPageMock) => {
    router.push(`/adminPanel/cms/edit/${page.id}`);
  };

  const triggerDelete = (page: CmsPageMock) => {
    setPageToDelete(page);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      const updated = pages.filter((p) => p.id !== pageToDelete.id);
      setPages(updated);
      saveStoredPages(updated);
      toast.success(`Đã xóa thành công trang "${pageToDelete.title}"!`);
      setDeleteConfirmOpen(false);
      setPageToDelete(null);
    }
  };

  const filteredPages = useMemo(() => {
    let result = [...pages];

    if (debouncedSearch) {
      result = result.filter(
        (page) =>
          page.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          page.slug.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (page.description && page.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
      );
    }

    if (filterActive !== "all") {
      result = result.filter((page) =>
        filterActive === "active" ? page.isActive : !page.isActive
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
        if (typeof valA === "boolean" && typeof valB === "boolean") {
          return desc ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
        }
        return desc
          ? new Date(valB).getTime() - new Date(valA).getTime()
          : new Date(valA).getTime() - new Date(valB).getTime();
      });
    }

    return result;
  }, [pages, debouncedSearch, filterActive, sorting]);

  const paginatedPages = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredPages.slice(start, end);
  }, [filteredPages, pagination]);

  const columns = React.useMemo<ColumnDef<CmsPageMock>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => {
        const pageIdx = pagination.pageIndex;
        const pageSize = pagination.pageSize;
        return (
          <span className="text-muted-foreground font-normal">
            {pageIdx * pageSize + row.index + 1}
          </span>
        );
      },
    },
    {
      accessorKey: "thumbnail",
      meta: { title: "Ảnh đại diện" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const thumb = row.getValue("thumbnail") as string;
        const title = row.original.title;
        return (
          <div className="size-11 rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center shadow-2xs">
            {thumb ? (
              <img src={thumb} alt={title} className="size-full object-cover" />
            ) : (
              <Icon icon="solar:gallery-remove-line-duotone" className="size-5 text-muted-foreground" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      meta: { title: "Trang CMS" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const slug = row.original.slug;
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[13px] font-bold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
              onClick={() => handleEdit(row.original)}
            >
              {title}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Icon icon="solar:link-broken-line-duotone" className="size-3" />
              /{slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      meta: { title: "Mô tả ngắn" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const desc = row.getValue("description") as string;
        return (
          <span className="text-xs text-muted-foreground max-w-[280px] block truncate font-medium">
            {desc || <span className="italic text-muted-foreground/60">(Không có mô tả)</span>}
          </span>
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
          <Badge variant={active ? "success" : "destructive"}>
            <Icon
              icon={active ? "solar:check-circle-line-duotone" : "solar:slash-circle-line-duotone"}
              className="size-3.5 mr-1"
            />
            {active ? "Hoạt động" : "Tạm ẩn"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      meta: { title: "Ngày tạo" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string;
        return (
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(dateStr).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
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
            onClick={() => {
              setPreviewPage(row.original);
              setPreviewOpen(true);
            }}
          >
            <Icon icon="solar:eye-line-duotone" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-vanixjnk hover:text-vanixjnk hover:bg-vanixjnk/10"
            onClick={() => handleEdit(row.original)}
          >
            <Icon icon="solar:pen-line-duotone" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => triggerDelete(row.original)}
          >
            <Icon icon="solar:trash-bin-trash-line-duotone" className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [pagination]);

  const renderMarkdown = (text: string) => {
    return <MdxRenderer content={text} scope={{ formData: previewPage }} />;
  };

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l border-r border-dashed border-primary/20 pt-[88px] pb-6 px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 shrink-0">
                <Icon icon="solar:bookmark-line-duotone" className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Trang CMS tĩnh</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý nội dung, bài viết giới thiệu, điều khoản điều kiện và thông tin chính sách của cửa hàng.
                </p>
              </div>
            </div>
            
            <Button
              variant="vanixjnk"
              size="sm"
              onClick={handleCreateNew}
              className="gap-1.5 shrink-0 font-semibold shadow-md"
            >
              <Icon icon="solar:add-circle-line-duotone" className="text-lg" />
              <span>Tạo trang mới</span>
            </Button>
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

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col mb-10">
        <div className="border-l border-r border-dashed border-primary/20 bg-card/10 flex-1 flex flex-col p-6 min-h-[500px]">
          <div className="space-y-6">
            <DataTable
              columns={columns}
              data={paginatedPages}
              isLoading={!isLoaded}
              searchPlaceholder="Tìm kiếm theo tiêu đề hoặc slug..."
              pageCount={Math.ceil(filteredPages.length / pagination.pageSize)}
              totalRecords={filteredPages.length}
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
                      placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
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
                          filterActive !== "all" && "text-vanixjnk border-vanixjnk/30 bg-vanixjnk/5 hover:bg-vanixjnk/10"
                        )}
                        title="Lọc trạng thái"
                      >
                        <Icon icon="solar:filter-line-duotone" className="size-4 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3 flex flex-col gap-2" align="end">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Trạng thái
                        </label>
                        <Select value={filterActive} onValueChange={(val: any) => setFilterActive(val)}>
                          <SelectTrigger size="sm" className="w-full justify-between bg-background border-border">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent position="popper" align="start">
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="active">Hoạt động</SelectItem>
                            <SelectItem value="inactive">Tạm ẩn</SelectItem>
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

      <GalleryDialog
        open={false}
        onOpenChange={() => {}}
        onSelect={() => {}}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-destructive font-bold">
              <Icon icon="solar:danger-line-duotone" className="size-5" />
              <span>Xác nhận xóa trang?</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5">
              Hành động này sẽ xóa vĩnh viễn trang CMS <strong>{pageToDelete?.title}</strong> khỏi cơ sở dữ liệu. Bạn chắc chắn muốn tiếp tục chứ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="text-xs font-bold"
            >
              Xóa trang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto p-0 rounded-2xl border border-border bg-background">
          {previewPage && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                  <span className="text-[10px] font-mono text-muted-foreground ml-3 bg-muted/60 px-3 py-0.5 rounded border border-border/80">
                    https://vanistudio.com/{previewPage.slug}
                  </span>
                </div>
                <Badge variant={previewPage.isActive ? "success" : "destructive"} className="text-[9px] font-bold">
                  {previewPage.isActive ? "Đã Xuất Bản" : "Bản Nháp"}
                </Badge>
              </div>

              {previewPage.thumbnail && (
                <div className="w-full h-48 bg-muted overflow-hidden relative">
                  <img src={previewPage.thumbnail} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
                    {previewPage.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 font-medium">
                    <span className="flex items-center gap-1"><Icon icon="solar:user-line-duotone" /> Admin</span>
                    <span className="text-border/80">•</span>
                    <span className="flex items-center gap-1">
                      <Icon icon="solar:calendar-line-duotone" />
                      {previewPage.publishedAt 
                        ? new Date(previewPage.publishedAt).toLocaleDateString("vi-VN") 
                        : "Bản nháp"
                      }
                    </span>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none border-t pt-5">
                  {renderMarkdown(previewPage.content)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
