import Link from "next/link";
import { Button } from "./ui/button";

export default function FormActions({ mode, deleteAction, cancelUrl }: { mode: "create" | "edit"; deleteAction?: () => void; cancelUrl: string }) {
    return (
        <div className="flex flex-row-reverse">
            <div className="flex space-x-2">
                {mode === "edit" && (
                    <Button variant="ghost" onClick={deleteAction}>
                        Löschen
                    </Button>
                )}
                <Link href={cancelUrl}>
                    <Button type="reset" variant="ghost">Abbrechen</Button>
                </Link>
                <Button type="submit">Speichern</Button>
            </div>
        </div>
    );
}