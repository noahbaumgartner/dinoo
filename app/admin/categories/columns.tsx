"use client"

import CategoryIcon from "@/components/category-icon"
import type { ListColumnDef } from "@/components/list"
import type { Category } from "@/lib/prisma"

export const columns: ListColumnDef<Category>[] = [
    {
        id: "name",
        cell: ({ row }) => (
            <div className="flex space-x-3 items-center">
                <CategoryIcon color={row?.color} icon={row?.icon} />
                <span className="font-semibold">{row?.name}</span>
            </div>
        ),
    }
]