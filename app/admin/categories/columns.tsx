"use client"

import CategoryIcon from "@/components/category-icon"
import type { ListColumnDef } from "@/components/list"
import type { Category } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const columns: ListColumnDef<Category>[] = [
    {
        id: "name",
        cell: ({ row }) => (
            <div className="flex space-x-3 items-center cursor-pointer" onClick={() => redirect(`/admin/categories/${row.id}`)}>
                <CategoryIcon color={row?.color} icon={row?.icon} />
                <span className="font-semibold">{row?.name}</span>
            </div>
        ),
    }
]