import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        vanixjnk: "border border-transparent border-vanixjnk/25 bg-vanixjnk/15 text-vanixjnk hover:bg-vanixjnk/15",
        success: "border border border-green-500/25 bg-green-500/15 text-green-500 hover:bg-green-500/15",
        danger: "border border border-red-500/25 bg-red-500/15 text-red-500 hover:bg-red-500/15",
        warning: "border border border-yellow-500/25 bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/15",
        sky: "border border border-sky-500/25 bg-sky-500/15 text-sky-500 hover:bg-sky-500/15",
        fuschia: "border border border-fuschia-500/25 bg-fuschia-500/15 text-fuschia-500 hover:bg-fuschia-500/15",
        rose: "border border border-rose-500/25 bg-rose-500/15 text-rose-500 hover:bg-rose-500/15",
        indigo: "border border border-indigo-500/25 bg-indigo-500/15 text-indigo-500 hover:bg-indigo-500/15",
        violet: "border border border-violet-500/25 bg-violet-500/15 text-violet-500 hover:bg-violet-500/15",
        orange: "border border border-orange-500/25 bg-orange-500/15 text-orange-500 hover:bg-orange-500/15",
        pink: "border border border-pink-500/25 bg-pink-500/15 text-pink-500 hover:bg-pink-500/15",
        lime: "border border border-lime-500/25 bg-lime-500/15 text-lime-500 hover:bg-lime-500/15",
        emerald: "border border border-emerald-500/25 bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15",
        teal: "border border border-teal-500/25 bg-teal-500/15 text-teal-500 hover:bg-teal-500/15",
        cyan: "border border border-cyan-500/25 bg-cyan-500/15 text-cyan-500 hover:bg-cyan-500/15",
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
