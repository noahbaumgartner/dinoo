"use client";

import { PaymentTypeTexts, PaymentTypes } from "@/lib/constants";
import { OrderItemOutputDTO } from "@/lib/dtos/orderItem.output.dto";
import { PaymentOutputDTO } from "@/lib/dtos/payment.output.dto";
import { PaymentItemOutputDTO } from "@/lib/dtos/paymentItem.output.dto";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

class OrderItemWithCountDTO extends OrderItemOutputDTO {
    count: number;
}

function OrderItems({
    orderItems,
    subtotalPrice,
    totalPrice,
    selectItem
}: {
    orderItems: OrderItemWithCountDTO[];
    subtotalPrice: number;
    totalPrice: number;
    selectItem: (orderItemId: string) => void;
}) {
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
                        <div className={`flex flex-row ${orderItem.count === 0 && "text-gray-300"}`}>
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
                        <div
                            className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer py-2 rounded-md flex flex-row"
                            onClick={() => orderItem.id && selectItem(orderItem.id)}>
                            <span className="grow text-center">Wählen</span>
                            <div className="px-1.5 mr-2 bg-gray-300 rounded-sm font-bold">{orderItem.count}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="shrink-0 grow-0 px-4 py-2 border-t-[1px] border-gray-200 bg-gray-50 rounded-b-md flex flex-row text-gray-600">
                <span className="text-sm">Zwischentotal</span>
                <span className="ml-auto text-sm">CHF {subtotalPrice}</span>
            </div>
            <div className="shrink-0 grow-0 px-4 py-2 border-t-[1px] border-gray-200 bg-gray-100 rounded-b-md flex flex-row font-bold">
                <span className="text-sm">Total</span>
                <span className="ml-auto text-sm">CHF {totalPrice}</span>
            </div>
        </div>
    )
}

function Payment({
    subtotalPrice,
    paySubOrder,
}: {
    subtotalPrice: number;
    paySubOrder: (paymentType: string) => void;
}) {
    const [moneyValue, setMoneyValue] = useState(0);
    const paymentDisabled = moneyValue < subtotalPrice;

    const MoneyValue = ({ value }: { value: number; }) => (
        <div
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer py-3 text-sm text-center rounded-md"
            onClick={() => setMoneyValue(value)}>
            {value}
        </div>
    )

    const PaymentType = ({
        type,
    }: {
        type: string;
    }) => (
        <button
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer py-3 text-sm text-center rounded-md outline-none"
            disabled={paymentDisabled}
            onClick={() => paySubOrder(type)}>
            {PaymentTypeTexts[type as keyof typeof PaymentTypeTexts]}
        </button>
    )

    return (
        <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1 flex flex-col">
            <div className="grow h-full w-full flex flex-col space-y-1 overflow-y-auto pb-1">
                <input
                    type="number"
                    className="border-[1px] text-center border-gray-200 rounded-md px-4 py-3 text-sm" placeholder="Betrag"
                    value={moneyValue}
                    onChange={(e) => setMoneyValue(Number(e.target.value))} />
                <div
                    className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer py-3 text-sm text-center rounded-md"
                    onClick={() => setMoneyValue(subtotalPrice)}>
                    Alles
                </div>
                <div className="flex flex-row space-x-1 w-full">
                    <MoneyValue value={5} />
                    <MoneyValue value={10} />
                    <MoneyValue value={20} />
                </div>
                <div className="flex flex-row space-x-1 w-full">
                    <MoneyValue value={50} />
                    <MoneyValue value={100} />
                    <MoneyValue value={200} />
                </div>
                <div className="border-b-[1px] border-gray-200 my-1"></div>
                <div className="flex flex-row space-x-1 w-full">
                    <PaymentType type={PaymentTypes.CASH} />
                    <PaymentType type={PaymentTypes.TWINT} />
                </div>
            </div>
            <div className="shrink-0 grow-0 px-4 py-2 border-t-[1px] border-gray-200 bg-gray-100 rounded-b-md flex flex-row font-bold">
                <span className="text-sm">Rückgeld</span>
                <span className="ml-auto text-sm">CHF </span>
            </div>
        </div>
    )
}

function Payments({
    payments,
}: {
    payments: PaymentOutputDTO[];
}) {
    return (
        <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1 flex flex-col">
            <div className="shrink-0 grow-0 px-4 py-2 border-b-[1px] border-gray-200 bg-gray-100 rounded-t-md">
                <h1 className="font-bold text-md">Zahlungen</h1>
            </div>
            <div className="grow overflow-auto">
                {payments.map((payment, index) => (
                    <div
                        key={index}
                        className={`text-sm px-4 py-4 flex flex-col space-y-4 ${index !== payments.length - 1 && "border-b-[1px]"}`}>
                        <div className="flex flex-row font-bold">
                            <span>{PaymentTypeTexts[payment.type as keyof typeof PaymentTypeTexts]}</span>
                            <span className="ml-auto">CHF {payment.items.reduce((total, item) => total + item.quantity * item.orderItem.product.price, 0)}</span>
                        </div>
                        {payment?.items?.length > 0 && (
                            <div className="flex flex-col space-y-2">
                                {payment.items.map(item => (
                                    <div key={item.id} className="flex flex-row">
                                        <span className="w-12">{item.quantity}x</span>
                                        <span className="grow">{item.orderItem.product.name}</span>
                                        <span>CHF {item.orderItem.product.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div
                            className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer py-2 rounded-md flex flex-row"
                            onClick={() => console.log()}>
                            <span className="grow text-center">Löschen</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function OrderById() {
    const [orderItems, setOrderItems] = useState<OrderItemWithCountDTO[]>([]);
    const [payments, setPayments] = useState<PaymentOutputDTO[]>([]);
    const [subtotalPrice, setSubtotalPrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const { id } = useParams();

    useEffect(() => {
        fetch(`/api/orders/${id}`).then(response => {
            return response.json()
        }).then(order => {
            const orderItemsWithCount = order.items.map((orderItem: OrderItemOutputDTO) => {
                return new OrderItemWithCountDTO({
                    ...orderItem,
                    count: 0
                });
            });
            setOrderItems(orderItemsWithCount);
        });
    }, [id]);

    useEffect(() => {
        const subtotal = orderItems.reduce((total, orderItem) => total + orderItem.product.price * orderItem.count, 0);
        const total = orderItems.reduce((total, orderItem) => total + orderItem.product.price * orderItem.quantity, 0);

        setSubtotalPrice(subtotal);
        setTotalPrice(total);
    }, [orderItems]);

    const selectItem = (orderItemId: string) => {
        const updatedOrderItems = orderItems.map(orderItem => {
            if (orderItem.id === orderItemId) {
                const newCount = orderItem.count + 1;
                const count = newCount > orderItem.quantity ? 0 : newCount;
                return {
                    ...orderItem,
                    count
                }
            }
            return orderItem;
        });
        setOrderItems(updatedOrderItems);
    }

    const paySubOrder = (paymentType: string) => {
        const paymentItems = orderItems.filter(orderItem => orderItem.count > 0).map(orderItem => {
            return new PaymentItemOutputDTO({
                quantity: orderItem.count,
                orderItem
            });
        });

        const payment = new PaymentOutputDTO({
            type: paymentType,
            items: paymentItems
        });

        setPayments([payment, ...payments]);

        const updatedOrderItems: OrderItemWithCountDTO[] = [];
        orderItems.forEach(orderItem => {
            orderItem.quantity = orderItem.quantity - orderItem.count;
            orderItem.count = 0;

            if (orderItem.quantity > 0) updatedOrderItems.push(orderItem);
        });
        setOrderItems(updatedOrderItems);
    }

    return (
        <main className="bg-gray-200 h-full w-full flex flex-row space-x-2">
            <div className="shrink-0 w-64">
                <OrderItems
                    orderItems={orderItems}
                    subtotalPrice={subtotalPrice}
                    totalPrice={totalPrice}
                    selectItem={selectItem}
                />
            </div>
            <div className="shrink-0 w-48">
                <Payment
                    subtotalPrice={subtotalPrice}
                    paySubOrder={paySubOrder}
                />
            </div>
            <div className="shrink-0 grow">
                <Payments payments={payments} />
            </div>
        </main>
    )
}