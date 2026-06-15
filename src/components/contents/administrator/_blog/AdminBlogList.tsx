"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, DataTableColumnHeader } from "@/components/vanixjnk/data-table";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { MdxRenderer } from "@/components/vanixjnk/mdx-builder";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { BlogMock } from "./types";
import { QuickSeedBlogsDialog } from "./QuickSeedBlogsDialog";
import { AdminBlogCommentsDialog } from "./AdminBlogCommentsDialog";
import { useSetting } from "@/contexts/SettingContext";
import { formatWithSiteTimezone } from "@/helpers/administrator/timezone.helper";

export default function BlogList() {
  const setting = useSetting();
  const siteTimezone = setting?.siteTimezone || "Asia/Ho_Chi_Minh";

  const router = useRouter();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<any | null>(null);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [commentsBlog, setCommentsBlog] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [filterActive]);

  const sortField = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? ("desc" as const) : ("asc" as const);
  const isActiveParam = filterActive === "all" ? undefined : filterActive === "active";

  const { data: statsData, isLoading, refetch, isFetching } = trpc.administrator.blog.getStats.useQuery(
    {
      search: debouncedSearch,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortField,
      sortOrder,
      isActive: isActiveParam,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const deleteMutation = trpc.administrator.blog.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateNew = () => {
    router.push("/adminPanel/blog/create");
  };

  const handleEdit = (blog: BlogMock) => {
    router.push(`/adminPanel/blog/edit/${blog.id}`);
  };

  const triggerDelete = (blog: BlogMock) => {
    setBlogToDelete(blog);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (blogToDelete) {
      try {
        await deleteMutation.mutateAsync({ id: blogToDelete.id });
        toast.success(`Đã xóa thành công bài viết "${blogToDelete.title}"!`);
        setDeleteConfirmOpen(false);
        setBlogToDelete(null);
      } catch (err: any) {
        toast.error(err.message || "Không thể xóa bài viết Blog này");
      }
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(() => [
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
      meta: { title: "Bài viết Blog" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const slug = row.original.slug;
        const isFeatured = row.original.isFeatured;
        return (
          <div className="flex flex-col gap-1">
            <span
              className="text-[13px] font-bold text-foreground hover:text-vanixjnk transition-colors cursor-pointer flex items-center gap-1.5 flex-wrap"
              onClick={() => handleEdit(row.original)}
            >
              {isFeatured && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border border-amber-500/25 shrink-0">
                  Nổi bật
                </Badge>
              )}
              {title}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
              <Icon icon="solar:link-broken-line-duotone" className="size-3" />
              /blog/{slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "tags",
      meta: { title: "Thẻ" },
      header: "Thẻ",
      cell: ({ row }) => {
        const tags = row.original.tags || [];
        if (tags.length === 0) {
          return <span className="text-[11px] italic text-muted-foreground/60">(Không có thẻ)</span>;
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal font-sans bg-muted/65 text-muted-foreground hover:bg-muted/65 border-none">
                {tag}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "stats",
      meta: { title: "Chỉ số" },
      header: "Chỉ số",
      cell: ({ row }) => {
        const views = row.original.views ?? 0;
        const likes = row.original.likes ?? 0;
        const readingTime = row.original.readingTime ?? 0;
        return (
          <div className="flex flex-col gap-1 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Icon icon="solar:eye-line-duotone" className="size-3.5 text-muted-foreground/80" />
              <span>{views} lượt xem</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon icon="solar:heart-line-duotone" className="size-3.5 text-red-500/80" />
              <span>{likes} lượt thích</span>
            </div>
            {readingTime > 0 && (
              <div className="flex items-center gap-1 text-vanixjnk">
                <Icon icon="solar:clock-circle-line-duotone" className="size-3.5" />
                <span>{readingTime} phút đọc</span>
              </div>
            )}
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
          <span className="text-xs text-muted-foreground max-w-[200px] block truncate font-medium">
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
            {formatWithSiteTimezone(dateStr, siteTimezone, "DD/MM/YYYY HH:mm")}
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
              className="size-8"
            >
              <Icon icon="solar:menu-dots-bold-duotone" className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1 flex flex-col gap-0.5" align="end">
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2"
              onClick={() => {
                setPreviewBlog(row.original);
                setPreviewOpen(true);
              }}
            >
              <Icon icon="solar:eye-line-duotone" className="mr-2 size-3.5" />
              Xem trước
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2"
              asChild
            >
              <a href={`/blog/${row.original.slug}`} target="_blank" rel="noopener noreferrer">
                <Icon icon="solar:arrow-right-up-line-duotone" className="mr-2 size-3.5" />
                Xem trực tiếp
              </a>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-foreground hover:bg-muted/50"
              onClick={() => {
                setCommentsBlog(row.original);
                setCommentsDialogOpen(true);
              }}
            >
              <Icon icon="solar:chat-line-line-duotone" className="mr-2 size-3.5 text-vanixjnk" />
              Bình luận
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-vanixjnk hover:text-vanixjnk hover:bg-vanixjnk/10"
              onClick={() => handleEdit(row.original)}
            >
              <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
              Chỉnh sửa
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => triggerDelete(row.original)}
            >
              <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
              Xóa
            </Button>
          </PopoverContent>
        </Popover>
      ),
    },
  ], [pagination, siteTimezone]);

  const renderMarkdown = (text: string) => {
    return <MdxRenderer content={text} scope={{ formData: previewBlog }} />;
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
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Blog</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Quản lý bài viết blog, tin tức công nghệ và chia sẻ kiến thức của Vani Studio.
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số bài viết</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : statsData?.data.stats.totalBlogs}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-vanixjnk bg-vanixjnk/10 border border-vanixjnk/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:bookmark-line-duotone" className="text-xl" />
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Đã xuất bản</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : statsData?.data.stats.activeBlogs}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-green-500 bg-green-500/10 border border-green-500/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:check-circle-line-duotone" className="text-xl" />
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Bản nháp</p>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : ((statsData?.data.stats.totalBlogs || 0) - (statsData?.data.stats.activeBlogs || 0))}
                  </h3>
                </div>
                <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <Icon icon="solar:file-text-line-duotone" className="text-xl" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
              <div className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Danh sách bài viết hoạt động</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Danh sách các bài viết blog, chia sẻ kiến thức công nghệ trên website.
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
                        onClick={() => refetch()}
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
                        onClick={handleCreateNew}
                      >
                        <Icon icon="solar:add-circle-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                        Tạo bài viết mới
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                        onClick={() => setSeedDialogOpen(true)}
                      >
                        <Icon icon="solar:database-line-duotone" className="mr-2 size-3.5 text-amber-500" />
                        Đổ dữ liệu mẫu
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <DataTable
                columns={columns}
                data={statsData?.data.items || []}
                isLoading={isLoading}
                searchPlaceholder="Tìm kiếm theo tiêu đề hoặc slug..."
                pageCount={statsData?.data.pagination.totalPages || 0}
                totalRecords={statsData?.data.pagination.total || 0}
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
                            <SelectTrigger className="w-full h-9 text-[13px] justify-between bg-background border-border">
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent position="popper" align="start">
                              <SelectItem value="all" className="text-[13px]">
                                <span className="flex items-center gap-2">
                                  <Icon icon="solar:widget-3-line-duotone" className="size-3.5 shrink-0 text-blue-500" />
                                  <span>Tất cả</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="active" className="text-[13px]">
                                <span className="flex items-center gap-2">
                                  <Icon icon="solar:check-circle-line-duotone" className="size-3.5 shrink-0 text-emerald-500" />
                                  <span>Hoạt động</span>
                                </span>
                              </SelectItem>
                              <SelectItem value="inactive" className="text-[13px]">
                                <span className="flex items-center gap-2">
                                  <Icon icon="solar:slash-circle-line-duotone" className="size-3.5 shrink-0 text-rose-500" />
                                  <span>Tạm ẩn</span>
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

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Icon icon="solar:danger-triangle-line-duotone" className="text-xl" />
              <span>Xác nhận xóa bài viết</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa bài viết <strong className="text-foreground font-semibold">{blogToDelete?.title}</strong> không? Hành động này không thể hoàn tác và bài viết sẽ bị xóa hoàn toàn khỏi hệ thống.
          </div>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Icon icon="solar:restart-line-duotone" className="mr-1.5 size-4 animate-spin" />
              )}
              Xác nhận xóa bài viết
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent 
          showCloseButton={false}
          className="sm:max-w-[800px] h-[85vh] max-h-[85vh] p-0 rounded-2xl border border-border bg-background flex flex-col overflow-hidden"
        >
          <DialogTitle className="sr-only">Xem trước bài viết</DialogTitle>
          <DialogDescription className="sr-only">Hiển thị nội dung xem trước của bài viết Blog</DialogDescription>
          {previewBlog && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30 select-none shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="size-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors focus:outline-none"
                    title="Đóng"
                  />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                  <span className="text-[10px] font-mono text-muted-foreground ml-3 bg-muted/60 px-3 py-0.5 rounded border border-border/80">
                    {origin || "https://vanistudio.com"}/blog/{previewBlog.slug}
                  </span>
                </div>
                <Badge variant={previewBlog.isActive ? "success" : "destructive"} className="text-[9px] font-bold">
                  {previewBlog.isActive ? "Đã Xuất Bản" : "Bản Nháp"}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0">
                {previewBlog.thumbnail && (
                  <div className="w-full h-48 bg-muted overflow-hidden relative">
                    <img src={previewBlog.thumbnail} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
                      {previewBlog.title}
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 font-medium">
                      <span className="flex items-center gap-1"><Icon icon="solar:user-line-duotone" /> Admin</span>
                      <span className="text-border/80">•</span>
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:calendar-line-duotone" />
                        {previewBlog.publishedAt 
                          ? formatWithSiteTimezone(previewBlog.publishedAt, siteTimezone, "DD/MM/YYYY") 
                          : "Bản nháp"
                        }
                      </span>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none border-t pt-5">
                    {renderMarkdown(previewBlog.content)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <QuickSeedBlogsDialog
        open={seedDialogOpen}
        onOpenChange={setSeedDialogOpen}
        onSuccess={() => refetch()}
      />

      <AdminBlogCommentsDialog
        open={commentsDialogOpen}
        onOpenChange={setCommentsDialogOpen}
        blog={commentsBlog}
      />
    </div>
  );
}
