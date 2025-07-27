"use client"

import { useSidebar } from "@/components/ui/sidebar";

export default function AdminSidebarHeader() {
    const { open } = useSidebar();

    return (
        <h1 className="text-lg font-semibold px-2 leading-10 overflow-hidden whitespace-nowrap">{open ? "🦖 dinoo" : "🦖"}</h1>
    );
}