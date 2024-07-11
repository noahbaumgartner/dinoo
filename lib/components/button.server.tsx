import type { ReactNode } from "react";

export default function Button({
    className,
    children
}: Readonly<{
    className?: string;
    children: ReactNode;
}>) {
    return (
        <button
            className={`${className} py-2 px-3 bg-black text-white text-sm rounded-lg`}>
            {children}
        </button>
    )
}