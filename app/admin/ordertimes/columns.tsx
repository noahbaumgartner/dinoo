"use client"

import type { ListColumnDef } from "@/components/list"
import type { OrderTime } from "@/lib/prisma"

export const columns: ListColumnDef<OrderTime>[] = [
    {
        id: "time",
        cell: ({ row }) => {
            return <span className="font-semibold">{row.time}</span>
        },
    }
]