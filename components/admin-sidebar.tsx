import { ChartArea, Hamburger, List, Printer, Ratio } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import AdminSidebarHeader from "./admin-sidebar-header"
import { NavigationBlock } from "./navigation-block"

const navigation = {
    configuration: [
        {
            title: "Produkteverwaltung",
            icon: Hamburger,
            isGroup: true,
            isActive: true,
            items: [
                {
                    title: "Produkte",
                    url: "/admin/products",
                },
                {
                    title: "Kategorien",
                    url: "/admin/categories",
                },
                {
                    title: "Bestellzeiten",
                    url: "/admin/ordertimes",
                }
            ],
        },
        {
            title: "Tische",
            icon: Ratio,
            url: "/admin/tables",
            isGroup: false,
        },
        {
            title: "Druck",
            icon: Printer,
            isGroup: true,
            isActive: true,
            items: [
                {
                    title: "Drucker",
                    url: "/admin",
                },
                {
                    title: "Layouts",
                    url: "/admin",
                }
            ],
        }
    ],
    monitoring: [
        {
            title: "Bestellungen",
            icon: List,
            url: "/admin",
            isGroup: false,
        },
        {
            title: "Auswertung",
            icon: ChartArea,
            url: "/admin",
            isGroup: false,
        }
    ]
}

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AdminSidebarHeader />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <NavigationBlock
                    title="Konfiguration"
                    items={navigation.configuration}
                />
                <NavigationBlock
                    title="Überwachung"
                    items={navigation.monitoring}
                />
            </SidebarContent>
        </Sidebar >
    )
}