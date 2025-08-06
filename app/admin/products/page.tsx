import { productService } from "@/lib/services/product.service";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import List from "@/components/list";
import { columns } from "./columns";
import { categoryService } from "@/lib/services/category.service";
import CategoryIcon from "@/components/category-icon";

export default async function AdminProductsPage() {
    const products = await productService.getAll();
    const categories = await categoryService.getAll();

    const productsWithCategory = categories.map(category => ({
        ...category,
        products: products.filter(product => product.categoryId === category.id)
    })).filter(category => category.products.length > 0);

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
            {productsWithCategory.map(category => (
                <div key={category.id} className="my-4 flex flex-col space-y-4">
                    <Link href={`/admin/categories/${category.id}`} className="flex items-center space-x-2 px-2">
                        <CategoryIcon color={category.color} icon={category.icon} />
                        <h2 className="text-lg font-semibold">{category.name}</h2>
                    </Link>
                    <List columns={columns} data={category.products} />
                </div>
            ))}
        </PageWrapper>
    );
}