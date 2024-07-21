"use server";

import { DrinkBeer24Regular, DrinkToGo24Regular, Food24Regular, FoodCake24Regular } from "@fluentui/react-icons";

export default async function MenuGroups() {
    const menuGroups = await fetch("http://localhost:3000/api/menuGroups").then(res => res.json()).then(menuGroups => {
        menuGroups.map((menuGroup) => {
            switch (menuGroup.icon) {
                case "Food24Regular":
                    menuGroup.icon = <Food24Regular />;
                    break;
                case "DrinkBeer24Regular":
                    menuGroup.icon = <DrinkBeer24Regular />;
                    break;
                case "DrinkToGo24Regular":
                    menuGroup.icon = <DrinkToGo24Regular />;
                    break;
                case "FoodCake24Regular":
                    menuGroup.icon = <FoodCake24Regular />;
                    break;
            }
            switch (menuGroup.color) {
                case "GRAY":
                    menuGroup.color = "bg-gray-100";
                    break;
                case "RED":
                    menuGroup.color = "bg-red-100";
                    break;
                case "ORANGE":
                    menuGroup.color = "bg-orange-100";
                    break;
                case "YELLOW":
                    menuGroup.color = "bg-yellow-100";
                    break;
                case "GREEN":
                    menuGroup.color = "bg-green-100";
                    break;
                case "BLUE":
                    menuGroup.color = "bg-blue-100";
                    break;
                case "VILOLET":
                    menuGroup.color = "bg-violet-100";
                    break;
                case "PINK":
                    menuGroup.color = "bg-pink-100";
                    break;
            }
        });
        return menuGroups;
    })

    return (
        <div className=" h-full w-full rounded-lg">
            {menuGroups.map((menuGroup, index) => (
                <div key={index} className="w-full h-auto px-4 py-4 flex flex-row space-x-2 justify-between cursor-pointer bg-white rounded-md drop-shadow-md hover:bg-gray-50 active:bg-gray-100">
                    <h1 className="text-sm leading-8">{menuGroup.name}</h1>
                    <div className={`${menuGroup.color} flex items-center py-1 px-1.5 rounded-md`}>
                        {menuGroup.icon}
                    </div>
                </div>
            ))}
        </div>
    );
}