import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table";
import { Pencil } from "lucide-react";
import { menuService } from "@/lib/services/menu.service";
import { UpdateMenuDialog } from "./updateMenuDialog";

const tabs = {
    GENERAL: "general",
    MENU_GROUPS: "menu-groups"
}

export default async function SingleMenuPage({
    params,
}: {
    params: Promise<{ menuId: string }>
}) {
    const { menuId } = await params;
    const menu = await menuService.getById(menuId);
    const menuAreas = await menuService.getMenuAreas(menuId);

    if (!menu) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>🔍 Menü nicht gefunden ...</CardTitle>
                    <CardDescription>Das angegebene Menü konnte nicht gefunden werden.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="flex flex-col space-y-4">
            <Card className="grow-0">
                <CardHeader className="flex flex-row justify-between">
                    <div className="flex flex-col space-y-1.5">
                        <CardTitle>{menu.name}</CardTitle>
                        <CardDescription>{menu.description}</CardDescription>
                    </div>
                    <div className="ml-4">
                        <UpdateMenuDialog item={menu} />
                    </div>
                </CardHeader>
            </Card>
            <Card className="grow">
                <CardHeader>
                    <CardTitle>Menü-Bereiche</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-0">
                    <DataTable columns={[]} data={[]} />
                </CardContent>
            </Card>
        </div>
    )
}