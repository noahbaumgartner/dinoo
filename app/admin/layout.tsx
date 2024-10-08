import Navigation from "@/components/admin/navigation"
import Sidebar from "@/components/admin/navigation"

export const metadata = {
  title: "dinoo"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation>
        {children}
      </Navigation>
    </>
  )
}
