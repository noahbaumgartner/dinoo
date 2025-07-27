"use client"

import type { Product } from "@/lib/prisma"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Beschreibung",
    },
    {
        accessorKey: "price",
        header: "Preis",
    },
]