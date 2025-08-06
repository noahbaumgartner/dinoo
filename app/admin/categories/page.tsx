import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import List from "@/components/list";
import { columns } from "./columns";
import { categoryService } from "@/lib/services/category.service";

export default async function AdminProductsPage() {
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
            <List columns={columns} data={categories} />
        </PageWrapper>
    );
}