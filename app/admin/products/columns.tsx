"use client"

import type { ListColumnDef } from "@/components/list"
import type { Product } from "@/lib/prisma"

export const columns: ListColumnDef<Product>[] = [
    {
        id: "name",
        cell: ({ row }) => (
            <span className="font-semibold">{row?.name}</span>
        ),
    },
    {
        id: "description",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.price.toFixed(2)} CHF
            </span>
        ),
    }
]