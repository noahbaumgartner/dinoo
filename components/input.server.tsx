export default function Input({
    type,
    placeholder,
    className
}: Readonly<{
    type: string;
    placeholder: string;
    className?: string;
}>) {
    return (
        <input
            type={type}
            className={`${className} py-2 px-3 mt-4 block w-full border-2 border-black rounded-lg`}
            placeholder={placeholder}
        />
    )
}