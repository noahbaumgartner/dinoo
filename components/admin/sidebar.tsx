"use client";

import { Boxes, ClipboardList, GalleryHorizontal, GalleryHorizontalEnd, GalleryVertical, GalleryVerticalEnd, GripHorizontal, GripVertical, Home, Layout, LayoutList, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

function SidebarItem({ icon: Icon, children, collapsed, route, variant = "ghost", onClick }: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    children: React.ReactNode;
    collapsed: boolean;
    route?: string;
    variant?: "ghost" | "secondary" | "default";
    onClick?: () => void;
}) {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === `/admin${route}`) {
        variant = "default";
    }

    const changeRoute = () => router.push(`/admin${route}`);

    if (collapsed) {
        return (
            <Button variant={variant} size="icon_sm" onClick={onClick || changeRoute}>
                <Icon className="size-4" />
            </Button>
        )
    }

    return (
        <Button variant={variant} size="sm" className="justify-start w-full" onClick={onClick || changeRoute}>
            <Icon className="size-4 mr-2" /> {children}
        </Button>
    )
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={cn(collapsed ? "w-14" : "w-64", "relative h-full flex flex-col border-r-[1px] border-[#E4E4E7] grow-0 shrink-0")}>
            <div className="p-2 border-b-[1px] border-[#E4E4E7]">
                <div className="rounded-md shadow-sm border-[1px] border-[#E4E4E7] cursor-pointer">
                    {collapsed ? (
                        <h1 className="text-md w-full text-center p-1.5">🦖</h1>
                    ) : (
                        <h1 className="text-md font-bold text-center py-1.5">🦖 Admin</h1>
                    )}
                </div>
            </div>
            <div className={cn("p-2.5 relative h-full flex flex-col justify-between")}>
                <div className="flex flex-col space-y-1">
                    <SidebarItem icon={Home} collapsed={collapsed} route="">Home</SidebarItem>
                    <SidebarItem icon={ClipboardList} collapsed={collapsed} route="/menus">Menu</SidebarItem>
                    <SidebarItem icon={LayoutList} collapsed={collapsed} route="/products">Products</SidebarItem>
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