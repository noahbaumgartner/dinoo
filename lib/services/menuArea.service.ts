import { PrismaClient } from "@prisma/client";

export const menuAreaService = {
    async getAll() {
        const prisma = new PrismaClient();
        return await prisma.menuArea.findMany();
    },

    async getById(id: string) {
        const prisma = new PrismaClient();
        return await prisma.menuArea.findUnique({
            where: {
                id,
            }
        });
    }
};