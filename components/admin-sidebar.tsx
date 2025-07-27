import { ChartArea, Hamburger, HandPlatter, Home, Ratio, Settings, Users } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import AdminSidebarHeader from "./admin-sidebar-header"

const groups = [
    {
        title: "Konfiguration",
        items: [
            {
                title: "Produkte",
                url: "/admin/products",
                icon: Hamburger,
            },
            {
                title: "Tische",
                url: "/admin/tables",
                icon: Ratio,
            },
            {
                title: "Personal",
                url: "/admin/staff",
                icon: Users,
            }
        ]
    },
    {
        title: "Betrieb",
        items: [
            {
                title: "Bestellungen",
                url: "/admin/orders",
                icon: HandPlatter,
            },
            {
                title: "Auswertung",
                url: "/admin/evaluation",
                icon: ChartArea,
            }
        ]
    }
]

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
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                                <Link href="/admin">
                                    <Home className="size-4" />
                                    <span>Start</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    {groups.map((group) => (
                        <div key={group.title}>
                            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </div>
                    ))}
                </SidebarGroup>
            </SidebarContent>
            <Separator />
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Settings className="size-4" />
                            <span>Einstellungen</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    )
}