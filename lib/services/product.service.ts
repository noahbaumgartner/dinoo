import { PrismaClient, type Product } from "@/lib/prisma";

const prisma = new PrismaClient();

export const productService = {
    async getAll() {
        return await prisma.product.findMany();
    },

    async create(product: Product) {
        const { categoryId, ...productData } = product;
        return await prisma.product.create({
            data: {
                ...productData,
                category: {
                    connect: { id: categoryId },
                }
            },
        });
    }
}