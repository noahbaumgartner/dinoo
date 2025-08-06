import ProductForm from "@/components/forms/product-form";
import { PageWrapper } from "@/components/page-wrapper";
import { categoryService } from "@/lib/services/category.service";
import { productService } from "@/lib/services/product.service";
import { redirect } from "next/navigation";

export default async function AdminEditProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await productService.getById(id);
    const categories = await categoryService.getAll();
    if (!product) {
        redirect("/admin/products");
    }

    return (
        <PageWrapper title="Produkt bearbeiten">
            <ProductForm mode="edit" product={product} categories={categories} />
        </PageWrapper>
    );
}