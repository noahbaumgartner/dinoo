"use client"

import type { ListColumnDef } from "@/components/list"
import type { OrderTime } from "@/lib/prisma"
import { redirect } from "next/navigation"

export const columns: ListColumnDef<OrderTime>[] = [
    {
        id: "time",
        cell: ({ row }) => {
            return <span className="font-semibold cursor-pointer" onClick={() => redirect(`/admin/ordertimes/${row.id}`)}>{row.time}</span>
        },
    }
]