"use client";

import type { OrderOutputDTO } from "@/lib/dtos/order.output.dto";
import type { OrderItemOutputDTO } from "@/lib/dtos/orderItem.output.dto";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function OrderItems({
    orderItems,
    removeItemFromOrder
}: {
    orderItems: OrderItemOutputDTO[];
    removeItemFromOrder: (productId: string) => void;
}) {
    const totalPrice = orderItems.reduce((total, orderItem) => total + orderItem.product.price * orderItem.quantity, 0);

    return (
        <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1 flex flex-col">
            <div className="shrink-0 grow-0 px-4 py-2 border-b-[1px] border-gray-200 bg-gray-100 rounded-t-md">
                <h1 className="font-bold text-md">Bestellübersicht</h1>
            </div>
            <div className="grow overflow-auto">
                {orderItems.map((orderItem, index) => (
                    <div
                        key={orderItem.product.id}
                        className={`text-sm px-4 py-4 flex flex-col space-y-4 ${index !== orderItems.length - 1 && "border-b-[1px]"}`}>
                        <div className="flex flex-row">
                            <span className="font-bold w-12">{orderItem.quantity}x</span>
                            <span className="font-bold">{orderItem.product.name}</span>
                            <span className="ml-auto">CHF {orderItem.product.price * orderItem.quantity}</span>
                        </div>
                        {orderItem?.modifiers?.length > 0 && (
                            <div className="flex flex-col space-y-2 bg-gray-100 rounded-md px-3 py-2 border-[1px] border-gray-300">
                                {orderItem.modifiers.map(modifier => (
                                    <div key={modifier.id} className="flex flex-row">
                                        <span className="">{modifier.name} (1x)</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer py-2 rounded-md flex flex-row">
                            <span className="grow text-center">Wählen</span>
                            <div className="px-1.5 mr-2 bg-gray-300 rounded-sm font-bold">0</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="shrink-0 grow-0 px-4 py-2 border-t-[1px] border-gray-200 bg-gray-50 rounded-b-md flex flex-row text-gray-600">
                <span className="text-sm">Zwischentotal</span>
                <span className="ml-auto text-sm">CHF {totalPrice}</span>
            </div>
            <div className="shrink-0 grow-0 px-4 py-2 border-t-[1px] border-gray-200 bg-gray-100 rounded-b-md flex flex-row font-bold">
                <span className="text-sm">Total</span>
                <span className="ml-auto text-sm">CHF {totalPrice}</span>
            </div>
        </div>
    )
}

export default function OrderById() {
    const [order, setOrder] = useState<OrderOutputDTO | null>(null);
    const { id } = useParams();

    useEffect(() => {
        fetch(`/api/orders/${id}`).then(response => {
            return response.json()
        }).then(order => {
            setOrder(order);
        });
    }, [id]);

    return (
        <main className="bg-gray-200 h-full w-full flex flex-row space-x-2">
            <div className="shrink-0 w-72">
                <OrderItems
                    orderItems={order?.items ?? []}
                    removeItemFromOrder={() => { }}
                />
            </div>
        </main>
    )
}