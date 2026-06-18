"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const LazySexyEditor = dynamic(
    () => import("./sexy-editor").then((mod) => mod.SexyEditor),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
        ),
    }
)