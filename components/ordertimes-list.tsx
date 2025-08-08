"use client";

import type { OrderTime } from "@/lib/prisma/wasm";
import type { ListColumnDef } from "./list";
import List from "./list";
import { updateOrderTime } from "@/lib/actions/ordertime";

export default function OrderTimesList({ columns, orderTimes }: { columns: ListColumnDef<OrderTime>[]; orderTimes: OrderTime[] }) {
    const handleChangeOrder = async (orderTimes: OrderTime[]) => {
        for (let index = 0; index < orderTimes.length; index++) {
            const orderTime = orderTimes[index];
            const formData = new FormData();

            orderTime.index = index + 1;

            formData.append("id", orderTime.id);
            formData.append("time", orderTime.time);
            formData.append("index", orderTime.index.toString());

            await updateOrderTime(formData, false);
        };
    }

    return (
        <List columns={columns} data={orderTimes} onOrderChangeAction={handleChangeOrder} />
    );
}