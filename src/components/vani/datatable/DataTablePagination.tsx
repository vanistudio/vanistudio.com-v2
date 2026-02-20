import { Table } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span>
            {table.getFilteredSelectedRowModel().rows.length} / {table.getFilteredRowModel().rows.length} đã chọn
          </span>
        )}
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="!h-6 py-0 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>/ {table.getFilteredRowModel().rows.length} kết quả</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <Icon icon="solar:alt-arrow-left-bold" className="text-xs" />
            <Icon icon="solar:alt-arrow-left-bold" className="text-xs -ml-1.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <Icon icon="solar:alt-arrow-left-bold" className="text-xs" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <Icon icon="solar:alt-arrow-right-bold" className="text-xs" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <Icon icon="solar:alt-arrow-right-bold" className="text-xs" />
            <Icon icon="solar:alt-arrow-right-bold" className="text-xs -ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
