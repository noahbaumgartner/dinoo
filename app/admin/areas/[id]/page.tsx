import AreaForm from "@/components/forms/area-form";
import { PageWrapper } from "@/components/page-wrapper";
import { areaService } from "@/lib/services/area.service";
import { redirect } from "next/navigation";

export default async function AdminEditAreaPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const area = await areaService.getById(id);
    if (!area) {
        redirect("/admin/areas");
    }

    return (
        <PageWrapper title="Bereich bearbeiten">
            <AreaForm mode="edit" area={area} />
        </PageWrapper>
    );
}