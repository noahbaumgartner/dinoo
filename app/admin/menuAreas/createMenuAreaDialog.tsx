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
import { Plus } from "lucide-react"
import { createMenu } from "@/actions/menu"
import { MenuAreaForm } from "./menuAreaForm"

export function CreateMenuAreaDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 size-4" /> Hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Menü-Bereich erstellen</DialogTitle>
                    <DialogDescription>
                        Erstellen Sie einen neuen Menü-Bereich
                    </DialogDescription>
                </DialogHeader>
                <MenuAreaForm id="menuForm" formAction={createMenu} />
                <DialogFooter>
                    <Button type="submit" form="menuForm">Erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
