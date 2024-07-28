import { PrismaClient } from "@prisma/client";
import { MenuGroupOutputDTO } from "../dtos/menuGroup.output.dto";
import { ProductOutputDTO } from "../dtos/product.output.dto";

export const menuGroupService = {
    async getAll() {
        const prisma = new PrismaClient();
        const menuGroups = await prisma.menuGroup.findMany({
            include: {
                MenuGroupItem: {
                    include: {
                        product: true
                    }
                }
            }
        });

        return menuGroups.map((menuGroup) => this.mapMenuGroupToDTO(menuGroup));
    },

    mapMenuGroupToDTO(menuGroup: any) {
        const items = menuGroup.MenuGroupItem ? menuGroup.MenuGroupItem.map((item: any) => new ProductOutputDTO({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price
        })) : [];
        
        return new MenuGroupOutputDTO({
            id: menuGroup.id,
            name: menuGroup.name,
            icon: menuGroup.icon,
            color: menuGroup.color,
            items
        });
    }
};