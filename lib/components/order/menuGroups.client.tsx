"use server";

import type { MenuGroupOutputDTO } from "@/lib/dtos/menuGroup.output.dto";
import MenuGroupIcon from "../menuGroupIcon.client";
import { menuGroupService } from "@/lib/services/menuGroup.service";

export default async function MenuGroups() {
    const menuGroups = await menuGroupService.getAll();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    return (
        <div className="h-full w-full rounded-lg flex flex-col space-y-2">
            {menuGroups.map((menuGroup) => (
                <div key={menuGroup.id} className="w-full h-auto px-4 py-4 flex flex-row space-x-2 justify-between cursor-pointer bg-white rounded-md drop-shadow-md hover:bg-gray-50 active:bg-gray-100">
                    <h1 className="text-sm leading-8">{menuGroup.name}</h1>
                    <div className={`bg-${menuGroup.color.toLowerCase()}-100 flex items-center py-1 px-1.5 rounded-md border-[1px] border-${menuGroup.color.toLowerCase()}-300`}>
                        <MenuGroupIcon icon={menuGroup.icon} className={`w-5 h-5 text-${menuGroup.color.toLowerCase()}-500`} />
                    </div>
                </div>
            ))}
        </div>
    );
}