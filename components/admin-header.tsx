import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function AdminHeader({ title }: { title?: string }) {
    return (
        <div className="flex flex-row justify-between p-2.5">
            <div className="flex flex-row space-x-2">
                <SidebarTrigger className="my-1" />
                <div className="py-2.5 pr-2">
                    <Separator orientation="vertical" />
                </div>
                <Breadcrumb className="py-2">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                        </BreadcrumbItem>
                        {title ? (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        ) : null}
                    </BreadcrumbList>
                </Breadcrumb>
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
        </div >
    );
}