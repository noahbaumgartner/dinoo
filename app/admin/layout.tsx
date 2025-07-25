import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}