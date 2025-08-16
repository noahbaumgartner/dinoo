import { PrismaClient, type Area } from "@/lib/prisma";

const prisma = new PrismaClient();

export const areaService = {
    async getAll() {
        const areas = await prisma.area.findMany();
        areas.sort((a, b) => {
            if (a.index !== b.index) {
                return a.index - b.index;
            }
            return a.name.localeCompare(b.name);
        });
        return areas;
    },

    async getById(id: string) {
        return await prisma.area.findUnique({
            where: { id },
        });
    },

    async create(area: Area) {
        return await prisma.area.create({
            data: area
        });
    },

    async update(area: Area) {
        return await prisma.area.update({
            where: { id: area.id },
            data: area,
        });
    },

    async delete(id: string) {
        return await prisma.area.delete({
            where: { id },
        });
    }
}