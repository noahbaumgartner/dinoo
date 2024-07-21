import { PrismaClient } from "@prisma/client";
import { MenuGroupOutputDTO } from "../dtos/menuGroup.output.dto";

export const menuGroupService = {
    async getAll() {
        const prisma = new PrismaClient();
        const menuGroups = await prisma.menuGroup.findMany();

        return menuGroups.map((menuGroup) => this.mapMenuGroupToDTO(menuGroup));
    },

    mapMenuGroupToDTO(menuGroup: any) {
        return new MenuGroupOutputDTO({
            id: menuGroup.id,
            name: menuGroup.name,
            icon: menuGroup.icon,
            color: menuGroup.color
        });
    }
};