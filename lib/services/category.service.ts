import { PrismaClient, type Category } from "@/lib/prisma";

const prisma = new PrismaClient();

export const categoryService = {
    async getAll() {
        return await prisma.category.findMany();
    },

    async getById(id: string) {
        return await prisma.category.findUnique({
            where: { id },
        });
    },

    async create(category: Category) {
        return await prisma.category.create({
            data: category,
        });
    },

    async update(category: Category) {
        return await prisma.category.update({
            where: { id: category.id },
            data: category,
        });
    },

    async delete(id: string) {
        return await prisma.category.delete({
            where: { id },
        });
    }
}