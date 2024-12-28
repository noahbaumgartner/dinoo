import { useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function ColorPicker({
    color,
    setColor
}: {
    color: string,
    setColor: (color: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false)
    const colors = [
        "red-400",
        "orange-400",
        "yellow-400",
        "green-400",
        "blue-400",
        "purple-400"
    ]

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger>
                <Button variant="outline" className="w-full">
                    <div className="h-3 w-full min-w-3 bg-gray-400 rounded-sm"></div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 grid grid-cols-3 gap-2">
                {colors.map((color) => (
                    <div
                        key={color}
                        className={`bg-${color} size-9 rounded-sm cursor-pointer`}
                        onClick={() => {
                            setColor(color)
                            setIsOpen(false)
                            console.log(color)
                        }}
                    ></div>
                ))}
            </PopoverContent>
        </Popover>
    )
}