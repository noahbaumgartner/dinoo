"use client";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MenuForm } from "../menuForm"
import { Pencil } from "lucide-react"
import { updateMenu } from "@/actions/menu"
import { useState } from "react";

export function UpdateMenuDialog({ item }: {
    item: {
        id: string
        name: string
        description: string
    }
}) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="flex flex-row space-x-2 align-middle">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Menü bearbeiten</DialogTitle>
                    <DialogDescription>
                        Bearbeiten Sie das Menü für Ihren nächsten Event
                    </DialogDescription>
                </DialogHeader>
                <MenuForm id="menuForm" item={item} formAction={async (formData) => {
                    await updateMenu(formData)
                    setIsOpen(false);
                }} />
                <DialogFooter>
                    <DialogClose asChild className="hidden">
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="menuForm">Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
