import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { productService } from "@/lib/services/product.service";
import { PageWrapper } from "@/components/page-wrapper";

export default async function AdminProductsPage() {
    const products = await productService.getAll();

    return (
        <PageWrapper title="Produkte">
            <Tabs defaultValue="products">
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
        </PageWrapper>
    );
}