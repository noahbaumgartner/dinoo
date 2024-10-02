import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

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
                {children}
            </body>
        </html>
    );
}
