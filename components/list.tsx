"use client";

import { GripHorizontal } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export type ListColumnDef<TData extends { id: string }> = {
    id: string
    accessorKey?: string
    cell?: ({ row }: { row: TData }) => React.ReactNode
}

interface ListProps<TData extends { id: string }> {
    columns: ListColumnDef<TData>[];
    data: TData[];
    onOrderChangeAction: (data: TData[]) => void;
}

export default function List<TData extends { id: string }>({ columns, data, onOrderChangeAction }: ListProps<TData>) {
    const [items, setItems] = useState<TData[]>(data);
    const [draggingItem, setDraggingItem] = useState<{ id: string } | null>(null);
    const [orderChanged, setOrderChanged] = useState(false);
    const isFirstRender = useRef(true);

    const handleDragStart = (e: React.DragEvent, item: { id: string }) => {
        setDraggingItem(item)

        if (e.dataTransfer) {
            e.dataTransfer.setData("text/plain", item.id.toString());
            e.dataTransfer.effectAllowed = "move";

            const dragGhost = document.createElement("div");
            dragGhost.style.position = "absolute";
            dragGhost.style.width = "1px";
            dragGhost.style.height = "1px";
            dragGhost.style.opacity = "0";
            document.body.appendChild(dragGhost);

            e.dataTransfer.setDragImage(dragGhost, 0, 0);
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, targetItem: { id: string }) => {
        e.preventDefault();
        if (draggingItem) {
            setItems((prevItems) => {
                const updatedItems = [...prevItems];
                const draggingIndex = updatedItems.findIndex((item) => item.id === draggingItem.id);
                const targetIndex = updatedItems.findIndex((item) => item.id === targetItem.id);
                [updatedItems[draggingIndex], updatedItems[targetIndex]] = [
                    updatedItems[targetIndex],
                    updatedItems[draggingIndex],
                ];
                return updatedItems;
            });
            setOrderChanged(true);
            setDraggingItem(null);
        }
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (orderChanged) {
            onOrderChangeAction(items);
            setOrderChanged(false);
        }
    }, [items, orderChanged, onOrderChangeAction]);

    return (
        <div className={`w-full border text-sm rounded-md bg-sidebar ${items.length === 0 ? "hidden" : ""}`}>
            <ul>
                {items.map((item, index) => (
                    <li
                        key={index}
                        onDragOver={(e) => {
                            handleDragOver(e);
                            if (draggingItem && draggingItem.id !== item.id) {
                                setItems((prevItems) => {
                                    const draggingIndex = prevItems.findIndex((i) => i.id === draggingItem.id);
                                    const targetIndex = prevItems.findIndex((i) => i.id === item.id);
                                    if (draggingIndex === -1 || targetIndex === -1 || draggingIndex === targetIndex) {
                                        return prevItems;
                                    }
                                    const updatedItems = [...prevItems];
                                    const [removed] = updatedItems.splice(draggingIndex, 1);
                                    updatedItems.splice(targetIndex, 0, removed);
                                    return updatedItems;
                                });
                            }
                        }}
                        onDrop={(e) => handleDrop(e, item)}
                        className={`py-2 px-3 ${index !== items.length - 1 ? "border-b" : ""} ${draggingItem?.id === item.id ? "opacity-50" : ""}`}
                    >
                        <div className="flex flex-row">
                            <div className="grow flex flex-row justify-between">
                                {columns.map((column, index) => (
                                    <span key={index} className="flex items-center">
                                        {column.cell && typeof column.cell === "function"
                                            ? column.cell({ row: item })
                                            : String(item[column.accessorKey as keyof typeof item])}
                                    </span>
                                ))}
                            </div>
                            <div
                                className="rounded-sm p-2 cursor-grab active:cursor-grabbing ml-2"
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                            >
                                <GripHorizontal className="size-4" />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}