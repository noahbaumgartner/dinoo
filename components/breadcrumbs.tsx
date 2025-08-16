"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Fragment } from "react";

const pathMapping: { [key: string]: string } = {
    "": "Home",
    "admin": "Admin",
    "areas": "Bereiche",
    "categories": "Kategorien",
    "new": "neu",
    "ordertimes": "Bestellzeiten",
    "products": "Produkte",
    "tables": "Tische",
};

export default function Breadcrumbs() {
    const pathname = usePathname();
    const pathSegments = pathname.split("/").filter((segment) => segment);

    return (
        <Breadcrumb className="py-2">
            <BreadcrumbList>
                {pathSegments.map((segment, index) => {
                    const isFirst = index === 0;
                    const isLast = index === pathSegments.length - 1;
                    const href = "/" + pathSegments.slice(0, index + 1).join("/");

                    return (
                        <Fragment key={index}>
                            {!isFirst && (
                                <BreadcrumbSeparator />
                            )}
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{pathMapping[segment] || segment}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{pathMapping[segment] || segment}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}