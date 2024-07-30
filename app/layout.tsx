import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "dinoo",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="bg-gray-200 text-gray-700">
      <body className={`${roboto.className} h-screen w-full flex flex-row p-2 space-x-2`}>
        {/* Sidebar */}
        <div className="h-full w-12 shrink-0">
          <div className="bg-white h-full w-full rounded-lg drop-shadow-md p-1 flex flex-col justify-between">
            <div className="w-full aspect-square border-[1px] hover:bg-gray-50 border-white active:bg-gray-100 hover:border-gray-300 rounded-md flex items-center justify-center cursor-pointer">
            </div>
            <div className="w-full aspect-square rounded-md p-1 hover:bg-gray-50 active:bg-gray-100 border-[1px] border-white hover:border-gray-300 cursor-pointer">
              <img src="https://media.licdn.com/dms/image/D4E03AQEzlR2sWweJ3w/profile-displayphoto-shrink_200_200/0/1693304718563?e=2147483647&v=beta&t=ukExtEDl-fXZT2txUDT0F58yE0xGwB1h0vJe-XcVok0" alt="Logo"
                className="w-full h-full overflow-hidden rounded-sm" />
            </div>
          </div>
        </div>
        <div className="w-full h-full">
          {children}
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
