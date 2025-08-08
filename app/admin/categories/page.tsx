import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { categoryService } from "@/lib/services/category.service";
import CategoriesList from "@/components/categories-list";

export default async function AdminCategoriesPage() {
    const categories = await categoryService.getAll();

    return (
        <PageWrapper
            title="Kategorien"
            action={
                <Link href="/admin/categories/new">
                    <Button variant="outline">
                        <Plus className="size-4" />
                        Neu
                    </Button>
                </Link>
            }
        >
            <CategoriesList columns={columns} categories={categories} />
        </PageWrapper>
    );
}