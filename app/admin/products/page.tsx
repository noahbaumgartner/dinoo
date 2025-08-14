import { productService } from "@/lib/services/product.service";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { categoryService } from "@/lib/services/category.service";
import ProductsList from "@/components/lists/products-list";

export default async function AdminProductsPage() {
    const products = await productService.getAll();
    const categories = await categoryService.getAll();

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
            <ProductsList columns={columns} categories={categories} products={products} />
        </PageWrapper>
    );
}