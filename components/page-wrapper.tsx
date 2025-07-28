import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import Breadcrumbs from "./breadcrumbs";

export function PageWrapper({ children, title, action }: { children: React.ReactNode; title?: string; action?: React.ReactNode }) {
    return (
        <div className="flex flex-col">
            <div className="flex flex-row justify-between p-2.5">
                <div className="flex flex-row space-x-2">
                    <SidebarTrigger className="my-1" />
                    <div className="py-2.5 pr-2">
                        <Separator orientation="vertical" />
                    </div>
                    <Breadcrumbs />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="outline">
                            <User className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mr-2.5">
                        <DropdownMenuItem>Konto</DropdownMenuItem>
                        <DropdownMenuItem>Abmelden</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="p-2.5 max-w-2xl w-full mx-auto flex flex-col space-y-4">
                <div className="flex flex-row justify-between px-2">
                    <h1 className="text-2xl font-semibold leading-9">{title}</h1>
                    {action}
                </div>
                {children}
            </div>
        </div >
    );
}