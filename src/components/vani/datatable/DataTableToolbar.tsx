import { Table } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const globalFilter = table.getState().globalFilter ?? "";

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-[260px]">
          <Icon icon="solar:magnifer-linear" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-8 h-8 text-sm"
            value={searchKey
              ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              : globalFilter}
            onChange={(e) => {
              if (searchKey) {
                table.getColumn(searchKey)?.setFilterValue(e.target.value);
              } else {
                table.setGlobalFilter(e.target.value);
              }
            }}
          />
        </div>

        {children}

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 px-2"
            onClick={() => table.resetColumnFilters()}
          >
            <Icon icon="solar:close-circle-linear" className="text-sm" />
            Xóa lọc
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
