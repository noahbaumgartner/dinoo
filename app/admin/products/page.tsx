import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { productService } from "@/lib/services/product.service";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminProductsPage() {
    const products = await productService.getAll();

    return (
        <PageWrapper
            title="Produkte"
            action={
                <Link href="/admin/products/new">
                    <Button variant="outline">
                        <Plus className="size-4" />
                        Neu
                    </Button>
                </Link>
            }
        >
            <DataTable columns={columns} data={products} />
        </PageWrapper>
    );
}