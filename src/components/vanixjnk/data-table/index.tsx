"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TanstackTable,
} from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "@/components/vanixjnk/data-table/data-table-pagination"
import { DataTableToolbar } from "@/components/vanixjnk/data-table/data-table-toolbar"
import { DataTableSkeleton } from "@/components/vanixjnk/data-table/data-table-skeleton"
import { DataTableEmpty } from "@/components/vanixjnk/data-table/data-table-empty"

interface DataTableProps<TData, TValue> {
  columns?: ColumnDef<TData, TValue>[]
  data?: TData[]
  searchPlaceholder?: string
  isLoading?: boolean
  toolbarInput?: React.ReactNode
  hideViewOptions?: boolean
  floatingActions?: (selectedRows: TData[], table: any) => React.ReactNode
  pageCount?: number
  pagination?: { pageIndex: number; pageSize: number }
  onPaginationChange?: (updater: any) => void
  sorting?: SortingState
  onSortingChange?: (updater: any) => void
  totalRecords?: number
  table?: TanstackTable<TData>
  getRowId?: (originalRow: TData, index: number, parent?: any) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  isLoading = false,
  toolbarInput,
  hideViewOptions,
  floatingActions,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  totalRecords,
  table: userTable,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [internalPagination, setInternalPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

  const isControlledPagination = pagination !== undefined && onPaginationChange !== undefined
  const isControlledSorting = sorting !== undefined && onSortingChange !== undefined

  const fallbackTable = useReactTable({
    data: data || [],
    columns: columns || [],
    state: {
      sorting: isControlledSorting ? sorting : internalSorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination: isControlledPagination ? pagination : internalPagination,
    },
    enableRowSelection: true,
    manualPagination: pageCount !== undefined,
    manualSorting: pageCount !== undefined,
    pageCount: pageCount ?? -1,
    onPaginationChange: isControlledPagination ? onPaginationChange : setInternalPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: isControlledSorting ? onSortingChange : setInternalSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: getRowId ? getRowId : (row: any) => row.id || row._id || undefined,
    autoResetPageIndex: false,
  })
  
  const table = (userTable ?? fallbackTable) as ReturnType<typeof useReactTable<TData>>;

  if (isLoading) {
    return <DataTableSkeleton columnCount={columns?.length || 5} rowCount={5} />
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} _forceRender={table.getState().columnVisibility} toolbarInput={toolbarInput} hideViewOptions={hideViewOptions} />
      <div className="rounded-md border border-border bg-background overflow-hidden relative shadow-sm">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <Table className="w-full min-w-max ">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border bg-background/60 hover:bg-background/80">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id} 
                        colSpan={header.colSpan} 
                        className="text-muted-foreground font-semibold px-4 align-middle whitespace-nowrap h-9"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-border bg-background/60 hover:bg-background/80 transition-none group/row"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="px-4 py-2 font-medium text-[13px] text-foreground align-middle whitespace-nowrap last:border-0 group-hover/row:bg-muted/10 transition-none"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="p-0 border-none shadow-none hover:bg-transparent"
                  >
                    <DataTableEmpty columnCount={table.getAllColumns().length} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination 
        table={table} 
        totalRecords={totalRecords} 
        currentPageIndex={table.getState().pagination.pageIndex}
        currentPageSize={table.getState().pagination.pageSize}
        currentPageCount={table.getPageCount()}
      />
      
      {floatingActions && (
        <div 
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 py-2.5 bg-popover/30 backdrop-blur-md text-foreground shadow-sm rounded-xl border border-border flex items-center justify-between gap-5 transition-all duration-100 ease-out",
            table.getFilteredSelectedRowModel().rows.length > 0 
              ? "opacity-100 translate-y-0 pointer-events-auto scale-100" 
              : "opacity-0 translate-y-8 pointer-events-none scale-95"
          )}
        >
           <div className="flex items-center gap-2.5 font-medium text-sm whitespace-nowrap pl-1">
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded bg-red-500/10 text-red-500 border-red-500/25 border text-xs font-bold shadow-sm transition-all">
                 {table.getFilteredSelectedRowModel().rows.length}
              </span>
              <span className="md:block hidden">bản ghi đã chọn</span>
           </div>
           <div className="flex items-center gap-2 pr-0.5">
             {floatingActions(
                table.getFilteredSelectedRowModel().rows.map(r => r.original),
                table as any
             )}
           </div>
        </div>
      )}
    </div>
  )
}

export { DataTableColumnHeader } from "./data-table-column-header"
