import { AdminHeader } from "@/components/admin-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { productService } from "@/lib/services/product.service";

export default async function AdminProductsPage() {
    const products = await productService.getAll();

    return (
        <>
            <AdminHeader title="Produkte" />
            <div className=" px-4 py-4 flex flex-col space-y-4">
                <h1 className="text-2xl font-semibold px-2">Produkte</h1>
                <Tabs defaultValue="products" className="flex flex-col space-y-2">
                    <TabsList>
                        <TabsTrigger value="products">Produkte</TabsTrigger>
                        <TabsTrigger value="categories">Kategorien</TabsTrigger>
                        <TabsTrigger value="times">Zeiten</TabsTrigger>
                        <TabsTrigger value="outputs">Outputs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="products">
                        <DataTable columns={columns} data={products} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}