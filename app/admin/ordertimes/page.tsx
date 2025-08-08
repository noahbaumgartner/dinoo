import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";
import { orderTimeService } from "@/lib/services/ordertime.service";
import OrderTimesList from "@/components/ordertimes-list";

export default async function AdminOrderTimesPage() {
    const orderTimes = await orderTimeService.getAll();

    return (
        <PageWrapper
            title="Bestellzeiten"
            action={
                <Link href="/admin/ordertimes/new">
                    <Button variant="outline">
                        <Plus className="size-4" />
                        Neu
                    </Button>
                </Link>
            }
        >
            <OrderTimesList columns={columns} orderTimes={orderTimes} />
        </PageWrapper>
    );
}