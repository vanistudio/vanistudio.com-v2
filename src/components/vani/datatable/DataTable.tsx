import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getExpandedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // ── Search ──
  searchKey?: string;
  searchPlaceholder?: string;

  // ── Toolbar ──
  toolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  toolbarChildren?: React.ReactNode;
  showToolbar?: boolean;

  // ── Pagination ──
  showPagination?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;

  // ── Row expand ──
  getSubRows?: (row: TData) => TData[] | undefined;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;

  // ── Styles ──
  className?: string;
  compact?: boolean;

  // ── Empty state ──
  emptyIcon?: string;
  emptyMessage?: string;

  // ── Callbacks ──
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  toolbar,
  toolbarChildren,
  showToolbar = true,
  showPagination = true,
  pageSizeOptions,
  defaultPageSize = 20,
  getSubRows,
  renderSubComponent,
  className,
  compact = false,
  emptyIcon = "solar:inbox-bold-duotone",
  emptyMessage = "Không có dữ liệu",
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows,
    enableRowSelection: true,
    initialState: {
      pagination: { pageSize: defaultPageSize },
    },
  });

  const cellPadding = compact ? "px-3 py-1.5" : "px-4 py-2.5";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={cn("w-full", className)}>
      {showToolbar && (
        toolbar ? toolbar(table) : (
          <DataTableToolbar
            table={table}
            searchKey={searchKey}
            searchPlaceholder={searchPlaceholder}
          >
            {toolbarChildren}
          </DataTableToolbar>
        )
      )}

      <div className="w-full overflow-auto">
        <table className="w-full caption-bottom">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className={cn(
                      cellPadding,
                      "text-left text-xs font-medium text-muted-foreground align-middle whitespace-nowrap",
                      "[&:has([role=checkbox])]:pr-0"
                    )}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "border-b border-border transition-colors",
                      "hover:bg-muted/30 data-[state=selected]:bg-muted/50",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          cellPadding,
                          textSize,
                          "align-middle [&:has([role=checkbox])]:pr-0"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {row.getIsExpanded() && renderSubComponent && (
                    <tr key={`${row.id}-expanded`}>
                      <td colSpan={row.getVisibleCells().length} className="p-0">
                        {renderSubComponent({ row })}
                      </td>
                    </tr>
                  )}
                </>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <div className="text-4xl text-muted-foreground/30">
                      <span className={emptyIcon} />
                    </div>
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />}
    </div>
  );
}
