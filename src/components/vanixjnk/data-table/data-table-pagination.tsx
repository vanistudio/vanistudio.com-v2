import type { Table } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/global/use-mounted";

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  totalRecords?: number;
  currentPageIndex?: number;
  currentPageSize?: number;
  currentPageCount?: number;
}

export function DataTablePagination<TData>({
  table,
  totalRecords,
  pageSizeOptions = [10, 20, 30, 40, 50, 100],
  className,
  currentPageIndex,
  currentPageSize,
  currentPageCount,
  ...props
}: DataTablePaginationProps<TData>) {
  const pageIndex = currentPageIndex ?? table.getState().pagination.pageIndex;
  const pageSize = currentPageSize ?? table.getState().pagination.pageSize;
  const pageCount = currentPageCount ?? table.getPageCount();
  
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div
      className={cn(
        "flex w-full flex-col-reverse items-center justify-between gap-4 p-1 sm:flex-row sm:gap-8",
        className,
      )}
      {...props}
    >
      <div className="flex-1 whitespace-nowrap text-muted-foreground text-sm">
        Đã chọn {table.getFilteredSelectedRowModel().rows.length}/{totalRecords ?? table.getFilteredRowModel().rows.length} hàng.
      </div>
      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="whitespace-nowrap font-medium text-sm">Số hàng/trang</p>
          <SelectWrapper
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-18 data-size:h-8">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((ps) => (
                <SelectItem key={ps} value={`${ps}`}>
                  {ps}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectWrapper>
        </div>
        <div className="flex items-center justify-center font-medium text-sm">
          Trang {pageIndex + 1} / {pageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            aria-label="Trang đầu"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canPreviousPage}
          >
            <Icon icon="solar:double-alt-arrow-left-line-duotone" className="size-4" />
          </Button>
          <Button
            aria-label="Trang trước"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!canPreviousPage}
          >
            <Icon icon="solar:alt-arrow-left-line-duotone" className="size-4" />
          </Button>
          <Button
            aria-label="Trang tiếp"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!canNextPage}
          >
            <Icon icon="solar:alt-arrow-right-line-duotone" className="size-4" />
          </Button>
          <Button
            aria-label="Trang cuối"
            variant="outline"
            size="icon"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!canNextPage}
          >
            <Icon icon="solar:double-alt-arrow-right-line-duotone" className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SelectWrapper({ children, ...props }: React.ComponentProps<typeof Select>) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex h-8 w-18 items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <span className="truncate">{props.value}</span>
      </div>
    );
  }

  return <Select {...props}>{children}</Select>;
}
