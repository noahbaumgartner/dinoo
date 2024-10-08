"use client";

import { Boxes, ClipboardList, GalleryHorizontal, GalleryHorizontalEnd, GalleryVertical, GalleryVerticalEnd, GripHorizontal, GripVertical, Home, Layout, LayoutList, Menu, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";

function SidebarItem({ icon: Icon, children, collapsed, route, variant = "ghost", onClick, setCollapsed }: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    children: React.ReactNode;
    collapsed: boolean;
    route?: string;
    variant?: "ghost" | "secondary" | "default";
    onClick?: () => void;
    setCollapsed: (collapsed: boolean) => void;
}) {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === `/admin${route}`) {
        variant = "default";
    }

    const changeRoute = () => {
        router.push(`/admin${route}`);
        setCollapsed(true);
    };

    if (collapsed) {
        return (
            <Button variant={variant} size="icon" onClick={onClick || changeRoute}>
                <Icon className="size-4" />
            </Button>
        )
    }

    return (
        <Button variant={variant} size="default" className="justify-start w-full" onClick={onClick || changeRoute}>
            <Icon className="size-4 mr-2" /> {children}
        </Button>
    )
}

export default function Navigation({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex flex-row w-full">
            <aside className={cn(collapsed ? "hidden sm:inline w-0 sm:w-14" : "w-full sm:w-64", "relative h-full flex flex-col border-r-[1px] border-[#E4E4E7] grow-0 shrink-0 bg-accent overflow-x-hidden")}>
                <div className={cn("py-2.5 relative flex flex-col justify-between h-full")}>
                    <div className="flex flex-col space-y-2.5">
                        <div className="px-2 border-[#E4E4E7]">
                            <div className="rounded-md shadow-sm border-[1px] border-[#E4E4E7] cursor-pointer bg-white">
                                {collapsed ? (
                                    <h1 className="text-md w-full text-center p-1.5">🦖</h1>
                                ) : (
                                    <h1 className="text-md font-bold text-center py-1.5">🦖 Dinoo</h1>
                                )}
                            </div>
                        </div>
                        <div className="px-2.5 flex flex-col space-y-1">
                            <SidebarItem icon={Home} collapsed={collapsed} route="" setCollapsed={setCollapsed}>Home</SidebarItem>
                            <SidebarItem icon={ClipboardList} collapsed={collapsed} route="/menus" setCollapsed={setCollapsed}>Menu</SidebarItem>
                            <SidebarItem icon={LayoutList} collapsed={collapsed} route="/products" setCollapsed={setCollapsed}>Products</SidebarItem>
                        </div>
                    </div>
                    <div className="px-2.5 flex flex-col space-y-2.5">
                        <SidebarItem
                            icon={collapsed ? PanelRightClose : PanelRightOpen}
                            collapsed={collapsed}
                            variant="ghost"
                            onClick={() => setCollapsed(!collapsed)}
                            setCollapsed={setCollapsed}
                        >Collapse</SidebarItem>
                    </div>
                </div>
            </aside>
            <div className="w-full h-full grow pt-14 sm:pt-0">
                <div className="sm:hidden fixed top-0 w-full p-2.5 flex flex-row justify-between bg-accent border-b-[1px] border-[#E4E4E7]">
                    <Button variant="outline" size="icon" onClick={() => setCollapsed(!collapsed)}>
                        <Menu className="size-4" />
                    </Button>
                    <img className="size-9 rounded-md shadow-sm cursor-pointer"
                        src="https://media.licdn.com/dms/image/D4E03AQEzlR2sWweJ3w/profile-displayphoto-shrink_200_200/0/1693304718563?e=2147483647&v=beta&t=ukExtEDl-fXZT2txUDT0F58yE0xGwB1h0vJe-XcVok0" alt="test" />
                </div>
                {children}
            </div>
        </div>
    )
}