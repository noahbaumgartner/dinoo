import AreaForm from "@/components/forms/area-form";
import { PageWrapper } from "@/components/page-wrapper";

export default async function AdminNewAreaPage() {
    return (
        <PageWrapper title="Bereich erstellen">
            <AreaForm mode="create" />
        </PageWrapper>
    );
}