"use client";

import { ClipboardList, Home, Menu, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

function SidebarItem({ icon: Icon, children, collapsed, variant = "ghost", onClick }: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    children: React.ReactNode;
    collapsed: boolean;
    variant?: "ghost" | "secondary";
    onClick?: () => void;
}) {
    if (collapsed) {
        return (
            <Button variant={variant} size="icon_sm" onClick={onClick}>
                <Icon className="size-4" />
            </Button>
        )
    }

    return (
        <Button variant={variant} size="sm" className="justify-start w-full" onClick={onClick}>
            <Icon className="size-4 mr-2" /> {children}
        </Button>
    )
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={cn(collapsed ? "w-14" : "w-72", "relative shadow-sm h-full flex flex-col border-r-[1px] border-accent")}>
            <div>
                {collapsed ? (
                    <h1 className="text-lg w-full text-center p-4">🦖</h1>
                ) : (
                    <h1 className="text-lg font-bold px-6 py-4">🦖 Admin</h1>
                )}
            </div>
            <div className={cn("px-2.5 pb-2.5 relative h-full flex flex-col space-y-0.5 justify-between")}>
                <div className="flex flex-col space-y-0.5">
                    <SidebarItem icon={Home} collapsed={collapsed}>Home</SidebarItem>
                    <SidebarItem icon={ClipboardList} collapsed={collapsed}>Menu</SidebarItem>
                </div>
                <div className="flex flex-col space-y-2.5">
                    <SidebarItem
                        icon={collapsed ? PanelRightClose : PanelRightOpen}
                        collapsed={collapsed}
                        variant="secondary"
                        onClick={() => setCollapsed(!collapsed)}
                    >Collapse</SidebarItem>
                </div>
            </div>
        </aside >
    )
}