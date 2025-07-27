import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function PageWrapper({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <div className="flex flex-col">
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
            </div>
            <div className="p-4 max-w-4xl w-full mx-auto flex flex-col space-y-4">
                <h1 className="text-2xl font-semibold px-2">{title}</h1>
                {children}
            </div>
        </div >
    );
}