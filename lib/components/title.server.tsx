import type { ReactNode } from "react";

export default function Title2({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <h1 className="text-3xl font-bold">{children}</h1>
    )
}