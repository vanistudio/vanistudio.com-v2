"use client";

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

interface DataTableDateFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  multiple?: boolean;
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title,
  multiple,
}: DataTableDateFilterProps<TData, TValue>) {
  return (
    <Button variant="outline" size="sm" className="h-8 border-dashed">
      <Icon icon="solar:calendar-date-line-duotone" className="mr-2 size-4" />
      {title}
    </Button>
  );
}
