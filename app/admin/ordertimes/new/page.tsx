import OrderTimeForm from "@/components/forms/ordertime-form";
import { PageWrapper } from "@/components/page-wrapper";

export default async function AdminNewOrderTimePage() {
    return (
        <PageWrapper title="Bestellzeit erstellen">
            <OrderTimeForm mode="create" />
        </PageWrapper>
    );
}