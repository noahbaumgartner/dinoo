import { Separator } from "@/components/ui/separator";

export function AdminHeader({ children, title }: { children?: React.ReactNode, title: string }) {
    return (
        <>
            <div className="py-2.5 px-4 flex flex-row space-x-2.5 justify-between">
                <h1 className="font-semibold leading-7">{title}</h1>
                {children}
            </div>
            <Separator />
        </>
    );
}