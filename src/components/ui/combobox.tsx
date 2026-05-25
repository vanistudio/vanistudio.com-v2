"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const Combobox = Popover

const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger> & { size?: "sm" | "default" }
>(({ className, size = "default", children, ...props }, ref) => (
  <PopoverTrigger 
    ref={ref} 
    data-size={size}
    className={cn(
      "border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-vanixjnk focus-visible:ring-vanixjnk/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=combobox-value]:line-clamp-1 *:data-[slot=combobox-value]:flex *:data-[slot=combobox-value]:items-center *:data-[slot=combobox-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDownIcon className="size-4 opacity-50" />
  </PopoverTrigger>
))
ComboboxTrigger.displayName = "ComboboxTrigger"

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, children, ...props }, ref) => (
  <PopoverContent
    ref={ref}
    align="start"
    className={cn(
      "w-(--radix-popover-trigger-width) p-0 z-50",
      className
    )}
    {...props}
  >
    <Command>
      {children}
    </Command>
  </PopoverContent>
))
ComboboxContent.displayName = "ComboboxContent"

const ComboboxSearchInput = React.forwardRef<
  React.ElementRef<typeof CommandInput>,
  React.ComponentPropsWithoutRef<typeof CommandInput>
>(({ className, ...props }, ref) => (
  <CommandInput
    ref={ref}
    className={cn("h-9 border-none focus-visible:ring-0 shadow-none text-[13px]", className)}
    {...props}
  />
))
ComboboxSearchInput.displayName = "ComboboxSearchInput"

const ComboboxList = CommandList
const ComboboxEmpty = CommandEmpty
const ComboboxGroup = CommandGroup

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ className, children, ...props }, ref) => (
  <CommandItem
    ref={ref}
    className={cn(
      "focus:bg-accent focus:text-accent-foreground data-selected:bg-accent data-selected:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-[13px] outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
      className
    )}
    {...props}
  >
    {children}
  </CommandItem>
))
ComboboxItem.displayName = "ComboboxItem"

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxSearchInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
}
