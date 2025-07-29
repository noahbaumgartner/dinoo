"use client"

import type { Product } from "@/lib/prisma"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Product>[] = [
    {
        id: "name",
        cell: ({ row }) => (
            <span className="font-semibold">{row.name}</span>
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