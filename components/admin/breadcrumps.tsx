import { ChevronRight } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";
import useMobileMode from "@/hooks/useMobileMode";

const pathMapping: { [key: string]: string } = {
    "": "Home",
    "admin": "Admin",
    "menus": "Menüs",
    "menuAreas": "Menü-Bereiche",
    "products": "Produkte",
    "orders": "Bestellungen",
    "clients": "Bestellgeräte",
    "outputDevices": "Ausgabegeräte",
    "layouts": "Saalpläne",
    "printTemplates": "Druckvorlagen",
    "new": "neu"
};

export function Breadcrumbs() {
    const isMobileMode = useMobileMode();

    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter((segment) => segment);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                    const isFirst = index === 0;
                    const isLast = index === pathSegments.length - 1;
                    const href = "/" + pathSegments.slice(0, index + 1).join("/");

                    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(segment) && isMobileMode) {
                        segment = "..."
                    }

                    return (
                        <React.Fragment key={index}>
                            {!isFirst && (
                                <BreadcrumbSeparator>
                                    <ChevronRight />
                                </BreadcrumbSeparator>
                            )}
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{pathMapping[segment] || segment}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{pathMapping[segment] || segment}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
