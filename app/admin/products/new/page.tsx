import ProductForm from "@/components/forms/product-form";
import { PageWrapper } from "@/components/page-wrapper";
import { categoryService } from "@/lib/services/category.service";

export default async function AdminNewProductPage() {
    const categories = await categoryService.getAll();

    return (
        <PageWrapper title="Produkt erstellen">
            <ProductForm mode="create" categories={categories} />
        </PageWrapper>
    );
}