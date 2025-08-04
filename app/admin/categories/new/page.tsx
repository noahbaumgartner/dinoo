import CreateCategoryForm from "@/components/forms/create-category-form";
import { PageWrapper } from "@/components/page-wrapper";

export default async function AdminNewProductPage() {
    return (
        <PageWrapper title="Kategorie erstellen">
            <CreateCategoryForm />
        </PageWrapper>
    );
}