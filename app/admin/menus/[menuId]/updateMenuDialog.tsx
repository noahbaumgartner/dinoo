import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MenuForm } from "../menuForm"
import { Pencil, Plus } from "lucide-react"
import { createMenu, updateMenu } from "@/actions/menuActions"

export function UpdateMenuDialog({ item }: {
    item: {
        id: string
        name: string
        description: string
    }
}) {
    return (
        <Dialog>
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
                <MenuForm id="menuForm" item={item} formAction={updateMenu} />
                <DialogFooter>
                    <Button type="submit" form="menuForm">Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
