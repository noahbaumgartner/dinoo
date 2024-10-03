import Sidebar from "@/components/admin/sidebar"

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
      <Sidebar />
      <div className="w-full h-full flex flex-col">
        <div className="border-b-[1px] border-[#E4E4E7] bg-white">
          <h1 className="text-lg font-bold px-4 leading-7 py-[13px]">Home</h1>
        </div>
        <div className="bg-gray-100 h-full">
          {children}
        </div>
      </div>
    </>
  )
}
