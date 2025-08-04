import { CATEGORY_ICON_NAME } from "@/lib/constants";
import { Beer, BottleWine, Coffee, GlassWater, Hamburger, Martini } from "lucide-react";

export default function CategoryIcon({ color, icon }: { color: "red" | "green" | "yellow" | "blue"; icon: string }) {
    const backgroundColorClasses = {
        red: "bg-red-100",
        green: "bg-green-100",
        yellow: "bg-yellow-100",
        blue: "bg-blue-100"
    }
    const strokeColorClasses = {
        red: "stroke-red-900",
        green: "stroke-green-900",
        yellow: "stroke-yellow-900",
        blue: "stroke-blue-900"
    }
    const iconProperties = `size-4 ${strokeColorClasses[color]}`

    return (
        <div className={`flex size-7 items-center justify-center rounded-md ${backgroundColorClasses[color]}`}>
            {(() => {
                switch (icon) {
                    case CATEGORY_ICON_NAME.martini.toString():
                        return <Martini className={iconProperties} />
                    case CATEGORY_ICON_NAME.beer.toString():
                        return <Beer className={iconProperties} />
                    case CATEGORY_ICON_NAME.coffee.toString():
                        return <Coffee className={iconProperties} />
                    case CATEGORY_ICON_NAME.bottleWine.toString():
                        return <BottleWine className={iconProperties} />
                    case CATEGORY_ICON_NAME.glassWater.toString():
                        return <GlassWater className={iconProperties} />
                    case CATEGORY_ICON_NAME.hamburger.toString():
                        return <Hamburger className={iconProperties} />
                }
            })()}
        </div>
    );
}