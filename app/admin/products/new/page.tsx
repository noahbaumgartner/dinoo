import CreateProductForm from "@/components/forms/create-product-form";
import { PageWrapper } from "@/components/page-wrapper";
import { categoryService } from "@/lib/services/category.service";

export default async function AdminNewProductPage() {
    const categories = await categoryService.getAll();

    return (
        <PageWrapper title="Produkt erstellen">
            <CreateProductForm categories={categories} />
        </PageWrapper>
    );
}