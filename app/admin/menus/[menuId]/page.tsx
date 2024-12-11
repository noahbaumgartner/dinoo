import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table";
import { Pencil } from "lucide-react";
import { menuService } from "@/lib/services/menu.service";
import { UpdateMenuDialog } from "./updateMenuDialog";
import { Separator } from "@/components/ui/separator";

const tabs = {
    GENERAL: "general",
    MENU_GROUPS: "menu-groups"
}

export default async function MenuPage({
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
                        <CardTitle className="text-lg">{menu.name}</CardTitle>
                        <CardDescription>{menu.description}</CardDescription>
                    </div>
                    <div className="ml-4">
                        <UpdateMenuDialog item={menu} />
                    </div>
                </CardHeader>
            </Card>
            <Card className="grow">
                <CardHeader>
                    <div className="flex flex-row gap-6">
                        <CardTitle>Bereiche</CardTitle>
                        <CardTitle className="font-normal">|</CardTitle>
                        <CardTitle className="font-normal">Layouts</CardTitle>
                        <CardTitle className="font-normal">|</CardTitle>
                        <CardTitle className="font-normal">blabliblub</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col space-y-0">
                    <DataTable columns={[]} data={[]} />
                </CardContent>
            </Card>
        </div>
    )
}