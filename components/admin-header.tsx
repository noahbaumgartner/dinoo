import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export function AdminHeader({ title }: { title?: string }) {
    return (
        <>
            <div className="flex flex-row p-2.5 space-x-2 h-12">
                <SidebarTrigger className="m-0" />
                <div className="py-1.5 pr-2">
                    <Separator orientation="vertical" />
                </div>
                <Breadcrumb className="py-1">
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
        </>
    );
}