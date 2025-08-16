"use client"

import type { ListColumnDef } from "@/components/list"
import type { Area } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const columns: ListColumnDef<Area>[] = [
    {
        id: "name",
        cell: ({ row }) => {
            return <span className="font-semibold cursor-pointer" onClick={() => redirect(`/admin/areas/${row.id}`)}>{row.name}</span>
        },
    }
]