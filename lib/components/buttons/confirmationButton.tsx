import type { FluentIcon } from "@fluentui/react-icons";
import type { ReactNode } from "react";

export default function ConfirmationButton({
    children,
    disabled,
    onClick,
    FluentIcon,
}: {
    children: ReactNode,
    disabled: boolean,
    onClick: () => void,
    FluentIcon: FluentIcon,
}) {
    return (
        <button
            className="shrink-0 bg-red-500 p-4 rounded-lg drop-shadow-md flex flex-row space-x-2 justify-center items-center cursor-pointer hover:bg-red-600 active:bg-red-700 disabled:bg-red-300 text-white outline-none"
            disabled={disabled}
            onClick={onClick}>
            <FluentIcon className="size-4" />
            <span className="text-lg font-bold">{children}</span>
        </button>
    );
}