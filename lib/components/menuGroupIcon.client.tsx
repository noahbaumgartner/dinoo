"use client";

import { DrinkBeer24Regular, DrinkToGo24Regular, Food24Regular, FoodCake24Regular } from "@fluentui/react-icons";
import { MenuGroupIcons } from "../constants";

export default function MenuGroupIcon({ className, icon }: {
    className?: string,
    icon: string,
}) {
    return (() => {
        switch (icon) {
            case MenuGroupIcons.DRINK_BEER:
                return <DrinkBeer24Regular className={className} />;
            case MenuGroupIcons.DRINK_TO_GO:
                return <DrinkToGo24Regular className={className} />;
            case MenuGroupIcons.FOOD:
                return <Food24Regular className={className} />;
            case MenuGroupIcons.FOOD_CAKE:
                return <FoodCake24Regular className={className} />;
            default:
                return null;
        }
    })();
}