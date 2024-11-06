import { PrismaClient } from "@prisma/client";
import { MenuGroupOutputDTO } from "../dtos/menuGroup.output.dto";
import { ProductOutputDTO } from "../dtos/product.output.dto";

export const menuService = {
    async getAll() {
        const prisma = new PrismaClient();
        return await prisma.menu.findMany();
    },

    async getById (id: string) {
        const prisma = new PrismaClient();
        return await prisma.menu.findUnique({
            where: {
                id,
            }
        });
    },

    async create(name: string, description: string) {
        const prisma = new PrismaClient();
        return await prisma.menu.create({
            data: {
                name,
                description
            }
        });
    }
};