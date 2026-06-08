"use client";

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DataTableSliderFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
}

export function DataTableSliderFilter<TData, TValue>({
  column,
  title,
}: DataTableSliderFilterProps<TData, TValue>) {
  return (
    <Button variant="outline" size="sm" className="h-8 border-dashed">
      <Icon icon="solar:slider-minimalistic-horizontal-line-duotone" className="mr-2 size-4" />
      {title}
    </Button>
  );
}
