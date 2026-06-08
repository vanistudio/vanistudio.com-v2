"use client";

import type { Column, Table } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import * as React from "react";

import { DataTableDateFilter } from "@/components/vanixjnk/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/vanixjnk/data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "@/components/vanixjnk/data-table/data-table-slider-filter";
import { DataTableViewOptions } from "@/components/vanixjnk/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  hideViewOptions?: boolean;
  _forceRender?: any;
  toolbarInput?: React.ReactNode;
}

export const DataTableToolbar = React.memo(({
  table,
  children,
  className,
  hideViewOptions = false,
  _forceRender,
  toolbarInput,
  ...props
}: DataTableToolbarProps<any>) => {
  const isFiltered = table.getState().columnFilters.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table, _forceRender],
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full flex-wrap items-start lg:items-center gap-1",
        className,
      )}
      {...props}
    >
      {toolbarInput && (
        <div className="flex flex-1 min-w-[150px] order-1">
          {toolbarInput}
        </div>
      )}

      <div className={cn("flex flex-wrap items-center gap-2 w-full lg:w-auto", toolbarInput ? "order-3 lg:order-2" : "order-1 flex-1")}>
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {children}
        {isFiltered && (
          <Button
            aria-label="Xóa bộ lọc"
            variant="outline"
            className="border-dashed h-8 px-2 lg:h-9 lg:px-3 text-red-500 hover:text-red-600 hover:bg-red-500/10 bg-background transition-none shadow-none font-medium text-[13px] rounded-md border-red-500/20"
            onClick={onReset}
          >
            <Icon icon="solar:close-circle-line-duotone" className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Xóa bộ lọc</span>
            <span className="inline lg:hidden">Xóa</span>
          </Button>
        )}
      </div>
      
      {!hideViewOptions && (
        <div className={cn("flex shrink-0 items-center justify-end", toolbarInput ? "order-2 lg:order-3" : "order-2")}>
          <DataTableViewOptions table={table} _forceRender={_forceRender} align="end" />
        </div>
      )}
    </div>
  );
})

DataTableToolbar.displayName = "DataTableToolbar"

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

const DataTableToolbarFilter = React.memo(({
  column,
}: DataTableToolbarFilterProps<any>) => {
  const columnMeta = column.columnDef.meta as any;

  const onFilterRender = React.useCallback(() => {
    if (!columnMeta?.variant) return null;

    switch (columnMeta.variant) {
      case "text":
        return (
          <Input
            placeholder={columnMeta.placeholder ?? columnMeta.label ?? "Tìm kiếm..."}
            value={(column.getFilterValue() as string) ?? ""}
            onChange={(event) => column.setFilterValue(event.target.value)}
            className="w-full flex-1 shadow-none rounded-md border-border font-medium text-[13px] bg-background h-8 lg:h-9"
          />
        );

      case "number":
        return (
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className={cn("w-[120px] shadow-none rounded-md border-border font-medium text-[13px] bg-background h-8 lg:h-9", columnMeta.unit && "pr-8")}
            />
            {columnMeta.unit && (
              <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                {columnMeta.unit}
              </span>
            )}
          </div>
        );

      case "range":
        return (
          <DataTableSliderFilter
            column={column}
            title={columnMeta.label ?? column.id}
          />
        );

      case "date":
      case "dateRange":
        return (
          <DataTableDateFilter
            column={column}
            title={columnMeta.label ?? column.id}
            multiple={columnMeta.variant === "dateRange"}
          />
        );

      case "select":
      case "multiSelect":
        return (
          <DataTableFacetedFilter
            column={column}
            title={columnMeta.label ?? column.id}
            options={columnMeta.options ?? []}
            multiple={columnMeta.variant === "multiSelect"}
          />
        );

      default:
        return null;
    }
  }, [column, columnMeta]);

  return onFilterRender();
})

DataTableToolbarFilter.displayName = "DataTableToolbarFilter"
