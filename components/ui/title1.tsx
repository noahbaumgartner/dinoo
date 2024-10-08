export default function Title1({ className, children }: {
    className?: string;
    children: React.ReactNode;
}) {
    return <h1 className={`text-xl font-bold ${className}`}>{children}</h1>;
}