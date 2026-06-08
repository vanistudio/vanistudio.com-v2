"use client";

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Icon } from "@iconify/react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/global/use-mounted";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>;
  label?: string;
  title?: string;
}

export const DataTableColumnHeader = React.memo(({
  column,
  label,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<any, any>) => {
  const displayLabel = label || title || (column.columnDef.meta as Record<string, any>)?.title || (column.columnDef.meta as Record<string, any>)?.label || column.id;

  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{displayLabel}</div>;
  }

  if (!(column.columnDef.meta as Record<string, any>)?.label) {
    column.columnDef.meta = { ...column.columnDef.meta, label: displayLabel };
  }

  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        className={cn(
          "-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 text-muted-foreground",
          className,
        )}
      >
        {displayLabel}
        {column.getCanSort() && <Icon icon="solar:sort-line-duotone" className="size-4 shrink-0" />}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {displayLabel}
        {column.getCanSort() &&
          (column.getIsSorted() === "desc" ? (
            <Icon icon="solar:alt-arrow-down-line-duotone" />
          ) : column.getIsSorted() === "asc" ? (
            <Icon icon="solar:alt-arrow-up-line-duotone" />
          ) : (
            <Icon icon="solar:sort-line-duotone" />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {column.getCanSort() && (
          <>
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "asc"}
              onCheckedChange={(checked) => {
                if (checked) {
                  column.toggleSorting(false);
                } else {
                  column.clearSorting();
                }
              }}
            >
              <Icon icon="solar:alt-arrow-up-line-duotone" />
              Tăng dần
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "desc"}
              onCheckedChange={(checked) => {
                if (checked) {
                  column.toggleSorting(true);
                } else {
                  column.clearSorting();
                }
              }}
            >
              <Icon icon="solar:alt-arrow-down-line-duotone" />
              Giảm dần
            </DropdownMenuCheckboxItem>
            <DropdownMenuItem
              className="pl-2 [&_svg]:text-muted-foreground"
              onSelect={() => column.clearSorting()}
            >
              <Icon icon="solar:close-circle-line-duotone" />
              Xóa sắp xếp
            </DropdownMenuItem>
          </>
        )}
        {column.getCanHide() && (
          <DropdownMenuCheckboxItem
            className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
            checked={!column.getIsVisible()}
            onCheckedChange={() => column.toggleVisibility(false)}
          >
            <Icon icon="solar:eye-closed-line-duotone" />
            Ẩn cột
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
})

DataTableColumnHeader.displayName = "DataTableColumnHeader";
