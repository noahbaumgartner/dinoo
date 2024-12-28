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
import ColorPicker from "@/components/admin/color-picker"

export function CreateMenuAreaDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" type="button">
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
                <MenuAreaForm id="menuAreaForm" formAction={createMenu} />
                <DialogFooter>
                    <Button type="submit" form="menuAreaForm">Erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
