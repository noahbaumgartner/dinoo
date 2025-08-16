import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { areaService } from "@/lib/services/area.service";
import { Plus } from "lucide-react";
import { columns } from "./columns";
import AreasList from "@/components/lists/areas-list";
import Link from "next/link";

export default async function AdminAreasPage() {
    const areas = await areaService.getAll();

    return (
        <PageWrapper
            title="Bereiche"
            action={
                <Link href="/admin/areas/new">
                    <Button variant="outline">
                        <Plus className="size-4" />
                        Neu
                    </Button>
                </Link>
            }
        >
            <AreasList columns={columns} areas={areas} />
        </PageWrapper>
    );
}