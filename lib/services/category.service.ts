import { PrismaClient, type Category } from "@/lib/prisma";

const prisma = new PrismaClient();

export const categoryService = {
    async getAll() {
        return await prisma.category.findMany();
    },

    async create(category: Category) {
        return await prisma.category.create({
            data: category,
        });
    }
}