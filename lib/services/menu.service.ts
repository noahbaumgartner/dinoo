import { PrismaClient } from "@prisma/client";

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
    },

    async update(id: string, name: string, description: string) {
        console.log(id, name, description)
        const prisma = new PrismaClient();
        return await prisma.menu.update({
            where: {
                id,
            },
            data: {
                name,
                description
            }
        });
    },

    async delete(id: string) {
        const prisma = new PrismaClient();
        return await prisma.menu.delete({
            where: {
                id,
            }
        });
    },

    async getMenuAreas(menuId: string) {
        const prisma = new PrismaClient();
        return await prisma.menuArea.findMany({
            where: {
                menuId
            }
        });
    }
};