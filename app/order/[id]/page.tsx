"use client";

import { useEffect, useState } from "react";
import MenuGroupIcon from "@/lib/components/menuGroupIcon.client";
import type { MenuGroupOutputDTO } from "@/lib/dtos/menuGroup.output.dto";
import { OrderItemDTO } from "@/lib/dtos/orderItem.output.dto";
import { SubtractSquare24Regular } from "@fluentui/react-icons";

function OrderItems({
    orderItems,
    removeItemFromOrder
}: {
    orderItems: OrderItemDTO[];
    removeItemFromOrder: (productId: string) => void;
}) {
    return (
        <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1">
            <div className="px-4 py-2 border-b-[1px] border-gray-200 bg-gray-100 rounded-t-md">
                <h1 className="font-bold text-md">Bestellübersicht</h1>
            </div>
            <div className="overflow-auto max-h-[calc(100vh-4rem)]">
                {orderItems.map((orderItem) => (
                    <div
                        key={orderItem.product.id}
                        className="border-b-[1px] text-sm px-4 py-4 flex flex-col space-y-4">
                        <div className="flex flex-row">
                            <span className="font-bold w-12">{orderItem.quantity}x</span>
                            <span className="font-bold">{orderItem.product.name}</span>
                            <span className="ml-auto">CHF {orderItem.product.price * orderItem.quantity}</span>
                        </div>
                        {orderItem.modifiers.length > 0 && (
                            <div className="flex flex-col space-y-2 bg-gray-100 rounded-md px-3 py-2 border-[1px] border-gray-300">
                                {orderItem.modifiers.map(modifier => (
                                    <div key={modifier.id} className="flex flex-row">
                                        <span className="">{modifier.name} (1x)</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-row space-x-2">
                            <div className="grow bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer py-2 rounded-md text-center">
                                Bearbeiten
                            </div>
                            <div
                                className="grow-0 shrink-0 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer py-2 px-2 rounded-md"
                                onClick={() => removeItemFromOrder(orderItem.product.id)}>
                                <SubtractSquare24Regular className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function MenuGroups({
    menuGroups,
    activeMenuGroup,
    selectMenuGroup
}: {
    menuGroups: MenuGroupOutputDTO[];
    activeMenuGroup: MenuGroupOutputDTO | null;
    selectMenuGroup: (menuGroupId: string) => void;
}) {
    return (
        <div className="h-full w-full rounded-lg flex flex-col space-y-2 overflow-y-auto">
            {menuGroups.map((menuGroup) => (
                <div
                    key={menuGroup.id}
                    className={`w-full h-auto px-4 py-4 flex flex-row space-x-2 justify-between cursor-pointer bg-white rounded-md drop-shadow-md hover:bg-gray-50 active:bg-gray-100 ${menuGroup.id === activeMenuGroup?.id && "font-bold"}`}
                    onClick={() => selectMenuGroup(menuGroup.id)}>
                    <h1 className="text-sm leading-8">{menuGroup.name}</h1>
                    <div className={`bg-${menuGroup.color.toLowerCase()}-100 flex items-center py-1 px-1.5 rounded-md border-[1px] border-${menuGroup.color.toLowerCase()}-300`}>
                        <MenuGroupIcon icon={menuGroup.icon} className={`w-5 h-5 text-${menuGroup.color.toLowerCase()}-500`} />
                    </div>
                </div>
            ))}
        </div>
    )
}

function MenuGroupItems({
    menuGroup,
    addItemToOrder
}: {
    menuGroup: MenuGroupOutputDTO | null;
    addItemToOrder: (productId: string) => void;
}) {
    return (
        <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1 flex flex-col space-y-1 overflow-y-auto">
            {menuGroup?.items.map((product) => (
                <div
                    key={product.id}
                    className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 cursor-pointer p-4 text-sm text-center rounded-md"
                    onClick={() => addItemToOrder(product.id)}>
                    {product.name}
                </div>
            ))}
        </div>
    )
}

export default function OrderById() {
    const [selectedMenuGroup, setSelectedMenuGroup] = useState<MenuGroupOutputDTO | null>(null);
    const [menuGroups, setMenuGroups] = useState<MenuGroupOutputDTO[]>([]);
    const [orderItems, setOrderItems] = useState<OrderItemDTO[]>([]);

    useEffect(() => {
        fetch("/api/menuGroups").then((response) => {
            return response.json()
        }).then(menuGroups => {
            setMenuGroups(menuGroups);
            setSelectedMenuGroup(menuGroups[0]);
        });
    }, []);

    const selectMenuGroup = (menuGroupId: string) => {
        const menuGroup = menuGroups.find(menuGroup => menuGroup.id === menuGroupId)
        menuGroup && setSelectedMenuGroup(menuGroup);
    }

    const addItemToOrder = (productId: string) => {
        const products = menuGroups.flatMap(menuGroup => menuGroup.items);
        const product = products.find(product => product.id === productId);

        if (!product) {
            throw new Error(`Product with id ${productId} not found`);
        }

        const productInOrder = orderItems.find(orderItem => orderItem.product.id === productId);
        if (productInOrder) {
            productInOrder.quantity += 1;
            setOrderItems([...orderItems]);
        } else {
            setOrderItems([...orderItems, {
                product,
                quantity: 1,
                modifiers: []
            }]);
        }
    }

    const removeItemFromOrder = (productId: string) => {
        const productInOrder = orderItems.find(orderItem => orderItem.product.id === productId);
        if (productInOrder) {
            if (productInOrder.quantity === 1) {
                setOrderItems(orderItems.filter(orderItem => orderItem.product.id !== productId));
            } else {
                productInOrder.quantity -= 1;
                setOrderItems([...orderItems]);
            }
        }
    }

    return (
        <main className="bg-gray-200 h-full w-full flex flex-row space-x-2">
            <div className="shrink-0 w-72">
                <OrderItems
                    orderItems={orderItems}
                    removeItemFromOrder={removeItemFromOrder}
                />
            </div>
            <div className="shrink-0 w-52">
                <MenuGroups
                    menuGroups={menuGroups}
                    activeMenuGroup={selectedMenuGroup}
                    selectMenuGroup={selectMenuGroup}
                />
            </div>
            {/* OrderList */}
            <div className="shrink-0 grow w-auto">
                <MenuGroupItems
                    menuGroup={selectedMenuGroup}
                    addItemToOrder={addItemToOrder}
                />
            </div>
        </main>
    )
}