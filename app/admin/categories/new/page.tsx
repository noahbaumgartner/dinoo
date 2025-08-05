import CategoryForm from "@/components/forms/category-form";
import { PageWrapper } from "@/components/page-wrapper";

export default async function AdminNewProductPage() {
    return (
        <PageWrapper title="Kategorie erstellen">
            <CategoryForm />
        </PageWrapper>
    );
}