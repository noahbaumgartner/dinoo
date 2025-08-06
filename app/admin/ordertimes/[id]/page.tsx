import OrderTimeForm from "@/components/forms/ordertime-form";
import { PageWrapper } from "@/components/page-wrapper";
import { orderTimeService } from "@/lib/services/ordertime.service";
import { redirect } from "next/navigation";

export default async function AdminEditOrderTimePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const orderTime = await orderTimeService.getById(id);
    if (!orderTime) {
        redirect("/admin/ordertimes");
    }

    return (
        <PageWrapper title="Kategorie bearbeiten">
            <OrderTimeForm mode="edit" orderTime={orderTime} />
        </PageWrapper>
    );
}