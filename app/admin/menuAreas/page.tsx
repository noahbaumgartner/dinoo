import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { CreateMenuAreaDialog } from "./createMenuAreaDialog";
import { columns } from "./columns";
import { menuAreaService } from "@/lib/services/menuArea.service";

export default async function MenuAreasPage({ }: {}) {
    const data = await menuAreaService.getAll();

    return (
        <Card className="overflow-scroll flex flex-col">
            <CardHeader>
                <CardTitle>Menü-Bereiche</CardTitle>
                <CardDescription>Dies ist eine Liste der Menüs-Bereiche, die in einem Event ergänzt werden können</CardDescription>
            </CardHeader>
            <CardContent className="grow">
                <DataTable columns={columns} data={data} tableActions={
                    <CreateMenuAreaDialog />
                } />
            </CardContent>
        </Card>
    )
}