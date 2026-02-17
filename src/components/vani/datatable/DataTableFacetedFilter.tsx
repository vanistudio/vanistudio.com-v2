import { Column } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: string;
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: FacetedFilterOption[];
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs border-dashed gap-1.5">
          <Icon icon="solar:filter-bold-duotone" className="text-sm" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal text-[10px] lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal text-[10px]">
                    {selectedValues.size} đã chọn
                  </Badge>
                ) : (
                  options.filter((opt) => selectedValues.has(opt.value)).map((opt) => (
                    <Badge key={opt.value} variant="secondary" className="rounded-sm px-1 font-normal text-[10px]">
                      {opt.label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Tìm ${title?.toLowerCase()}...`} className="h-8 text-xs" />
          <CommandList>
            <CommandEmpty className="text-xs py-4 text-center">Không tìm thấy</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => {
                const isSelected = selectedValues.has(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(opt.value);
                      } else {
                        selectedValues.add(opt.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(filterValues.length ? filterValues : undefined);
                    }}
                    className="text-xs"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    )}>
                      <CheckIcon className="h-3 w-3" />
                    </div>
                    {opt.icon && <Icon icon={opt.icon} className="mr-2 text-sm text-muted-foreground" />}
                    <span>{opt.label}</span>
                    {facets?.get(opt.value) != null && (
                      <span className="ml-auto flex h-4 items-center justify-center text-[10px] font-mono text-muted-foreground">
                        {facets.get(opt.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center text-xs"
                  >
                    Xóa bộ lọc
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
