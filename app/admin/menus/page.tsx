import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { menuService } from "@/lib/services/menu.service";
import { CreateMenuDialog } from "./createMenuDialog";

export default async function MenusPage({ }: {}) {
    const data = await menuService.getAll();

    return (
        <Card className="overflow-scroll flex flex-col">
            <CardHeader>
                <CardTitle>Menüs</CardTitle>
                <CardDescription>Dies ist eine Liste der Menüs mit welchen ein Event gestartet werden kann</CardDescription>
            </CardHeader>
            <CardContent className="grow">
                <DataTable columns={columns} data={data} tableActions={
                    <CreateMenuDialog />
                } />
            </CardContent>
        </Card>
    )
}