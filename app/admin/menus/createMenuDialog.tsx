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
import { MenuForm } from "./menuForm"
import { Plus } from "lucide-react"
import { createMenu } from "@/actions/menuActions"

export function CreateMenuDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 size-4" /> Hinzufügen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Menü erstellen</DialogTitle>
                    <DialogDescription>
                        Erstellen Sie ein neues Menü für Ihren nächsten Event
                    </DialogDescription>
                </DialogHeader>
                <MenuForm id="menuForm" formAction={createMenu} />
                <DialogFooter>
                    <Button type="submit" form="menuForm">Erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
