import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-end">
        <Skeleton className="h-9 w-[100px] rounded-lg" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent bg-muted/30">
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i} className="py-1 px-4 h-9">
                  <Skeleton className="h-5 w-full max-w-[150px] rounded-md" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="border-border hover:bg-transparent transition-none">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j} className="py-3 px-4">
                    <Skeleton className="h-5 w-full max-w-[200px] rounded-md" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Skeleton className="h-8 w-[100px] rounded-lg" />
        <Skeleton className="h-8 w-[70px] rounded-lg" />
        <div className="flex gap-1 ml-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
