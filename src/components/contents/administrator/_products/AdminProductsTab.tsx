"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "@bprogress/next/app";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { Product } from "@/server/db/schemas/product.schema";
import { QuickReorderProductsDialog } from "./QuickReorderProductsDialog";

export default function AdminProductsTab() {
  const router = useRouter();

  const [productsSearch, setProductsSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [productsSorting, setProductsSorting] = useState<SortingState>([]);
  const [productsPagination, setProductsPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(productsSearch);
      setProductsPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [productsSearch]);

  const sortField = productsSorting[0]?.id || "order";
  const sortOrder = productsSorting[0]?.desc ? ("desc" as const) : ("asc" as const);

  const { data: statsData, isLoading: productsLoading, refetch: refetchProducts, isFetching: productsFetching } =
    trpc.administrator.products.getStats.useQuery(
      {
        search: debouncedSearch,
        page: productsPagination.pageIndex + 1,
        limit: productsPagination.pageSize,
        sortField,
        sortOrder,
      },
      { refetchOnWindowFocus: false }
    );

  const deleteProductMutation = trpc.administrator.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Xóa sản phẩm thành công!");
      refetchProducts();
    },
    onError: (err) => toast.error(err.message || "Xóa thất bại"),
  });

  const formatPrice = (amount: number, currency: string) => {
    if (amount === 0) return "Free";
    try {
      return new Intl.NumberFormat(currency === "VND" ? "vi-VN" : "en-US", {
        style: "currency",
        currency: currency,
      }).format(amount);
    } catch (_) {
      return `${amount} ${currency}`;
    }
  };

  const productColumns = React.useMemo<ColumnDef<Product>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-normal">
          {productsPagination.pageIndex * productsPagination.pageSize + row.index + 1}
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
              <Icon icon="solar:box-line-duotone" className="size-5 text-muted-foreground" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      meta: { title: "Sản phẩm" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[13px] font-semibold text-foreground hover:text-vanixjnk transition-colors cursor-pointer"
              onClick={() => router.push(`/adminPanel/products/edit/${row.original.id}`)}
            >
              {row.original.name}
            </span>
            {row.original.isFeatured && (
              <Badge variant="success" className="text-[9px] py-0 px-1 font-bold">
                Nổi bật
              </Badge>
            )}
            {row.original.badge && (
              <Badge variant="outline" className="text-[9px] py-0 px-1 border-amber-500/30 text-amber-500 bg-amber-500/5 font-bold">
                {row.original.badge}
              </Badge>
            )}
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            /{row.original.slug}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      meta: { title: "Loại" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        const typesMap: Record<string, string> = {
          source_code: "Mã nguồn",
          tool: "Công cụ",
          app: "Ứng dụng",
          bot: "Robot/Bot",
          extension: "Tiện ích mở rộng",
        };
        return (
          <Badge variant="secondary" className="font-semibold text-[11px]">
            {typesMap[type] || type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      meta: { title: "Giá bán" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const { price, salePrice, currency } = row.original;
        if (salePrice !== null && salePrice !== undefined) {
          return (
            <div className="flex flex-col">
              <span className="text-xs text-foreground font-semibold">
                {formatPrice(salePrice, currency)}
              </span>
              <span className="text-[10px] text-muted-foreground line-through font-normal">
                {formatPrice(price, currency)}
              </span>
            </div>
          );
        }
        return (
          <span className="text-xs text-foreground font-semibold">
            {formatPrice(price, currency)}
          </span>
        );
      },
    },
    {
      accessorKey: "version",
      meta: { title: "Phiên bản" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => <span className="text-xs font-mono text-foreground font-medium">v{row.original.version}</span>,
    },
    {
      accessorKey: "licenseType",
      meta: { title: "Giấy phép" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const license = row.getValue("licenseType") as string;
        const licenseLabels: Record<string, string> = {
          single: "Single",
          extended: "Extended",
          subscription: "Sub",
          free: "Free",
        };
        return <span className="text-xs text-muted-foreground font-medium">{licenseLabels[license] || license}</span>;
      },
    },
    {
      accessorKey: "status",
      meta: { title: "Trạng thái" },
      header: ({ column }) => <DataTableColumnHeader column={column} />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variants: Record<string, "success" | "outline" | "danger" | "secondary"> = {
          active: "success",
          draft: "outline",
          archived: "danger",
        };
        const labels: Record<string, string> = {
          active: "Hoạt động",
          draft: "Bản nháp",
          archived: "Lưu trữ",
        };
        return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
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
              onClick={() => router.push(`/adminPanel/products/edit/${row.original.id}`)}
            >
              <Icon icon="solar:pen-line-duotone" className="mr-2 size-3.5" />
              Chỉnh sửa
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
              onClick={() => {
                setProductToDelete(row.original);
              }}
            >
              <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2 size-3.5" />
              Xóa sản phẩm
            </Button>
          </PopoverContent>
        </Popover>
      ),
    },
  ], [productsPagination]);

  return (
    <div className="p-6 space-y-6">
      {/* Khối Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tổng số sản phẩm</p>
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              {productsLoading ? <Skeleton className="h-8 w-16" /> : statsData?.data.stats.totalProducts}
            </h3>
          </div>
          <div className="size-10 rounded-lg text-indigo-500 bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0">
            <Icon icon="solar:box-line-duotone" className="text-xl" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Đang hoạt động</p>
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              {productsLoading ? <Skeleton className="h-8 w-16" /> : statsData?.data.stats.activeProducts}
            </h3>
          </div>
          <div className="size-10 rounded-lg text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Icon icon="solar:shield-check-line-duotone" className="text-xl" />
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-background/60 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Sản phẩm nổi bật</p>
            <h3 className="text-2xl font-extrabold text-foreground tracking-tight">
              {productsLoading ? <Skeleton className="h-8 w-16" /> : statsData?.data.stats.featuredProducts}
            </h3>
          </div>
          <div className="size-10 rounded-lg text-amber-500 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Icon icon="solar:star-line-duotone" className="text-xl" />
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground">Danh sách sản phẩm</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Danh sách mã nguồn, ứng dụng, bot đang bày bán hoặc giới thiệu.
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
                onClick={() => refetchProducts()}
                disabled={productsLoading || productsFetching}
              >
                <Icon
                  icon="solar:restart-line-duotone"
                  className={cn("mr-2 size-3.5 text-sky-500", (productsLoading || productsFetching) && "animate-spin")}
                />
                Làm mới
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 cursor-pointer"
                onClick={() => router.push("/adminPanel/products/create")}
              >
                <Icon icon="solar:add-circle-line-duotone" className="mr-2 size-3.5 text-emerald-500" />
                Tạo sản phẩm mới
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
        columns={productColumns}
        data={statsData?.data.items || []}
        isLoading={productsLoading}
        pageCount={statsData?.data.pagination.totalPages || 0}
        totalRecords={statsData?.data.pagination.total || 0}
        pagination={productsPagination}
        onPaginationChange={setProductsPagination}
        sorting={productsSorting}
        onSortingChange={setProductsSorting}
        toolbarInput={
          <div className="relative flex-1">
            <Icon icon="solar:magnifer-line-duotone" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              className="pl-9 h-9 w-full"
              value={productsSearch}
              onChange={(e) => setProductsSearch(e.target.value)}
            />
          </div>
        }
      />

      <QuickReorderProductsDialog
        open={sortDialogOpen}
        onOpenChange={setSortDialogOpen}
        onSuccess={() => refetchProducts()}
      />

      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Icon icon="solar:danger-line-duotone" className="size-5" />
              Xác nhận xóa sản phẩm
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold text-foreground">"{productToDelete?.name}"</span>?
            Hành động này không thể hoàn tác.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setProductToDelete(null)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteProductMutation.isPending}
              onClick={() => {
                if (productToDelete) {
                  deleteProductMutation.mutate({ id: productToDelete.id });
                  setProductToDelete(null);
                }
              }}
            >
              {deleteProductMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
