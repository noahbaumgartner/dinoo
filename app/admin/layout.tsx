import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Separator } from "@/components/ui/separator"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="w-full">
                <div>
                    <div className="py-2.5 px-4 flex flex-row space-x-2.5">
                        <h1 className="font-semibold leading-7">Artikel</h1>
                    </div>
                    <Separator />
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}