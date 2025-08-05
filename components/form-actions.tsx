import Link from "next/link";
import { Button } from "./ui/button";

export default function FormActions({ cancelUrl }: { cancelUrl: string }) {
    return (
        <div className="flex flex-row-reverse">
            <div className="flex space-x-2">
                <Link href={cancelUrl}>
                    <Button type="reset" variant="ghost">Abbrechen</Button>
                </Link>
                <Button type="submit">Speichern</Button>
            </div>
        </div>
    );
}