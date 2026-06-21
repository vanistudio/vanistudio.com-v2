"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Check } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/global/use-mounted";

interface DataTableViewOptionsProps<TData>
  extends React.ComponentProps<typeof PopoverContent> {
  table: Table<TData>;
  disabled?: boolean;
  triggerClassName?: string;
  _forceRender?: any;
}

export function DataTableViewOptions({
  table,
  disabled,
  triggerClassName,
  _forceRender,
  ...props
}: DataTableViewOptionsProps<any>) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  const mounted = useMounted();

  if (!mounted) {
    return (
      <Button
        aria-label="Toggle columns"
        variant="outline"
        size="sm"
        className={cn("h-9 shadow-sm", triggerClassName)}
        disabled={disabled}
      >
        <Icon icon="solar:settings-line-duotone" className="size-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Toggle columns"
          role="combobox"
          variant="outline"
          size="sm"
          className={cn("h-9", triggerClassName)}
          disabled={disabled}
        >
          <Icon icon="solar:settings-line-duotone" className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[200px] p-0 shadow-sm" {...props}>
        <Command>
          <CommandInput placeholder="Tìm cột..." />
          <CommandList className="custom-scrollbar">
            <CommandEmpty>Không tìm thấy cột nào.</CommandEmpty>
            <CommandGroup>
              {columns.map((column) => {
                const isVisible = column.getIsVisible();
                const title = (column.columnDef.meta as { title?: string })?.title ?? column.id;
                
                return (
                  <CommandItem
                    key={column.id}
                    value={title}
                    data-is-visible={isVisible ? "true" : "false"}
                    onSelect={() => column.toggleVisibility()}
                    className="cursor-pointer font-medium text-[13px] py-1.5 [&>svg:last-child]:hidden group/command-item"
                  >
                    <span className={cn("truncate flex-1 transition-all", !isVisible && "opacity-50 line-through decoration-muted-foreground/40")}>
                      {title}
                    </span>
                    <Check
                      strokeWidth={3}
                      className="ml-auto size-4 shrink-0 text-primary opacity-0 transition-opacity duration-200 group-data-[is-visible=true]/command-item:opacity-100"
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
