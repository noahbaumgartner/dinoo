"use client";

import { DrinkBeer24Regular, DrinkToGo24Regular, Food24Regular, FoodCake24Regular } from "@fluentui/react-icons";


const MenuGroupIcons = {
    DRINK_BEER: 'DRINK_BEER',
    DRINK_TO_GO: 'DRINK_TO_GO',
    FOOD: 'FOOD',
    FOOD_CAKE: 'FOOD_CAKE',
}
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