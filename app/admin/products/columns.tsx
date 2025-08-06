"use client"

import type { ListColumnDef } from "@/components/list"
import type { Product } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const columns: ListColumnDef<Product>[] = [
    {
        id: "name",
        cell: ({ row }) => (
            <span className="font-semibold cursor-pointer" onClick={() => redirect(`/admin/products/${row.id}`)}>{row?.name}</span>
        ),
    },
    {
        id: "price",
        cell: ({ row }) => (
            <span className="text-muted-foreground">
                {row.price.toFixed(2)} CHF
            </span>
        ),
    }
]