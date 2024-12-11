import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table";
import { UpdateMenuDialog } from "./updateMenuDialog";
import { menuAreaService } from "@/lib/services/menuArea.service";

const tabs = {
    GENERAL: "general",
    MENU_GROUPS: "menu-groups"
}

export default async function MenuAreaPage({
    params,
}: {
    params: Promise<{ menuAreaId: string }>
}) {
    const { menuAreaId } = await params;
    const menuArea = await menuAreaService.getById(menuAreaId);

    if (!menuArea) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>🔍 Menü-Bereich nicht gefunden ...</CardTitle>
                    <CardDescription>Der Menü-Bereich konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="flex flex-col space-y-4">
            <Card className="grow-0">
                <CardHeader className="flex flex-row justify-between">
                    <div className="flex flex-col space-y-1.5">
                        <CardTitle>{menuArea.name}</CardTitle>
                    </div>
                    <div className="ml-4">
                    </div>
                </CardHeader>
            </Card>
            <Card className="grow">
                <CardHeader>
                    <CardTitle>Produkte</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-0">
                    <DataTable columns={[]} data={[]} />
                </CardContent>
            </Card>
        </div>
    )
}