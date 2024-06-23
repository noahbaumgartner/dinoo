import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  style: "normal",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "vilii",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
