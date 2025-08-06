import CategoryForm from "@/components/forms/category-form";
import { PageWrapper } from "@/components/page-wrapper";
import { categoryService } from "@/lib/services/category.service";
import { redirect } from "next/navigation";

export default async function AdminEditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const category = await categoryService.getById(id);
    if (!category) {
        redirect("/admin/categories");
    }

    return (
        <PageWrapper title="Kategorie bearbeiten">
            <CategoryForm mode="edit" category={category} />
        </PageWrapper>
    );
}