"use client"

import { deleteMenu } from "@/actions/menu"
import { openMenuArea } from "@/actions/menuArea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowRight, Trash2 } from "lucide-react"

export type Menu = {
    id: string,
    name: string
}

export const columns: ColumnDef<Menu>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <Button
                variant="link"
                size="inline"
                onClick={() => openMenuArea(row.original.id)}
                className="flex items-center space-x-2"
            >
                {row.original.name}
            </Button>
        ),
    },
    {
        id: "color",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Farbe" />
        ),
        cell: ({ row }) => (
            <div className="w-12 h-4 rounded-sm bg-blue-300">

            </div>
        )
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon_sm">
                        <span className="sr-only">Open menu</span>
                        <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => openMenuArea(row.original.id)}>
                        <ArrowRight className="mr-2 size-4" />
                        Öffnen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => deleteMenu(row.original.id)}>
                        <Trash2 className="mr-2 size-4" />
                        Löschen
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    }
]
