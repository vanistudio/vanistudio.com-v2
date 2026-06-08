import * as React from "react"
import { Column } from "@tanstack/react-table"
import { Icon } from "@iconify/react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: string
  }[]
  multiple?: boolean
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  multiple,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(column?.getFilterValue() as string[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 shadow-none rounded-lg border-border border-dashed bg-background font-semibold hover:bg-muted transition-none">
          <Icon icon="solar:plus-circle-line-duotone" className="mr-2 h-4 w-4 text-muted-foreground" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <div className="mx-2 h-4 w-px bg-border" />
              <Badge variant="secondary" className="rounded-sm px-1 font-bold bg-primary/10 text-primary hover:bg-primary/20 lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none">
                    {selectedValues.size} đã chọn
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-bold bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none">
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0 shadow-sm rounded-lg border-border" align="start">
        <Command>
          <CommandInput placeholder={title} className="font-semibold text-sm outline-none focus:ring-0" />
          <CommandList>
            <CommandEmpty className="text-sm font-medium text-muted-foreground py-6 text-center">Không có lựa chọn nào.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      )
                    }}
                    className="font-semibold text-[13px] cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "opacity-50 border-primary [&_svg]:invisible"
                      )}
                    >
                      <Icon icon="solar:check-read-line-duotone" className={cn("h-3 w-3")} />
                    </div>
                    {option.icon && (
                      <Icon icon={option.icon} className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center font-mono text-[10px] bg-muted/80 rounded-full border border-border">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center font-bold text-muted-foreground cursor-pointer hover:bg-muted"
                  >
                    Xóa tất cả bộ lọc
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
