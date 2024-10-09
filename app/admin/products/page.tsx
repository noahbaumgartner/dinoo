import Title1 from "@/components/ui/title1";
import { columns, type Product } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { productService } from "@/lib/services/product.service";

export default async function Home({ }: {}) {
    const products = await productService.getAll();
    const data = products.map(({ name, price }) => ({
        select: false,
        name,
        price
    }));

    return (
        <Card className="">
            <CardHeader>
                <CardTitle>Produkte</CardTitle>
                <CardDescription>Dies ist eine Liste der erfassten Produkte</CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={data} />
            </CardContent>
        </Card>
    )
}