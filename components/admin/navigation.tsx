"use client";

import { Armchair, Box, Boxes, ChartArea, ChartBar, ChevronRight, ClipboardList, GalleryHorizontal, GalleryHorizontalEnd, GalleryVertical, GalleryVerticalEnd, GripHorizontal, GripVertical, Home, Layout, LayoutList, Menu, PanelLeft, PanelRightClose, PanelRightOpen, Printer, ReceiptText, Salad, Settings, ShoppingBag, ShoppingBasket, ShoppingCart, SlashIcon, Tablet, Tablets, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "../ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Breadcrumbs } from "./breadcrumps";
import { Separator } from "../ui/separator";

function SidebarItem({ icon: Icon, children, route, variant = "ghost", onClick }: {
    icon: React.ComponentType<{
        className?: string;
    }>;
    children: React.ReactNode;
    route?: string;
    variant?: "ghost" | "secondary" | "default";
    onClick?: () => void;
}) {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === `/admin${route}`) {
        variant = "secondary";
    }

    const changeRoute = () => {
        router.push(`/admin${route}`);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant={variant} size="icon" onClick={onClick || changeRoute}>
                        <Icon className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="-mt-2">
                    <p>{children}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function SidebarSeparator() {
    return (
        <div className="px-2.5">
            <Separator />
        </div>
    )
}

export default function Navigation({ children }: { children: React.ReactNode }) {

    return (
        <div className="flex flex-row w-full">
            <aside className={cn("w-0 sm:w-14 relative h-full flex flex-col border-r-[1px] border-[#E4E4E7] grow-0 shrink-0 bg-white overflow-x-hidden")}>
                <div className={cn("py-2.5 relative flex flex-col justify-between h-full")}>
                    <div className="flex flex-col space-y-2.5">
                        <div className="px-2.5 border-[#E4E4E7]">
                            <div className="rounded-full border-[1px] border-[#E4E4E7] cursor-pointer bg-primary size-9 flex flex-row justify-center items-center">
                                <ShoppingBag className="size-4 text-white" />
                            </div>
                        </div>
                        <div className="px-2.5 flex flex-col space-y-1">
                            <SidebarItem icon={Home} route="">Home</SidebarItem>
                            <SidebarSeparator />
                            <SidebarItem icon={Salad} route="/menus">Menus</SidebarItem>
                            <SidebarItem icon={Box} route="/products">Produkte</SidebarItem>
                            <SidebarItem icon={Armchair} route="/layouts">Saalpläne</SidebarItem>
                            <SidebarSeparator />
                            <SidebarItem icon={ShoppingCart} route="/orders">Bestellungen</SidebarItem>
                            <SidebarSeparator />
                            <SidebarItem icon={Tablet} route="/clients">Bestellgeräte</SidebarItem>
                            <SidebarItem icon={Printer} route="/outputDevices">Ausgabegeräte</SidebarItem>
                            <SidebarItem icon={ReceiptText} route="/printTemplates">Druckvorlagen</SidebarItem>
                        </div>
                    </div>
                    <div className="px-2.5 flex flex-col space-y-2.5">
                        <SidebarItem icon={Settings} route="/settings">Einstellungen</SidebarItem>
                    </div>
                </div>
            </aside>
            <div className="w-full h-full grow bg-accent flex flex-col">
                <div className="w-full flex flex-row justify-between bg-white sm:bg-transparent px-3 py-2 sm:py-0 sm:px-6 sm:pt-6 border-b sm:border-0">
                    <div className="sm:hidden">
                        <Button variant="outline" size="icon">
                            <PanelLeft className="size-4" />
                        </Button>
                    </div>
                    <div className="flex items-center">
                        <Breadcrumbs />
                    </div>
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }))}>
                                <User className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="mr-4 sm:mr-6 mt-2">
                                <DropdownMenuLabel>Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="p-3 sm:p-6">
                    {children}
                </div>
            </div>
        </div >
    )
}