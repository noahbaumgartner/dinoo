import CreateOrderTimeForm from "@/components/forms/create-ordertime-form";
import { PageWrapper } from "@/components/page-wrapper";

export default async function AdminNewOrderTimePage() {
    return (
        <PageWrapper title="Bestellzeit erstellen">
            <CreateOrderTimeForm />
        </PageWrapper>
    );
}