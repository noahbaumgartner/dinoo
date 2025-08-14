import { PrismaClient, type Product } from "@/lib/prisma";

const prisma = new PrismaClient();

export const productService = {
    async getAll() {
        const products =  await prisma.product.findMany();
        products.sort((a, b) => {
            if (a.index !== b.index) {
                return a.index - b.index;
            }
            return a.name.localeCompare(b.name);
        });
        return products;
    },

    async getById(id: string) {
        return await prisma.product.findUnique({
            where: { id },
        });
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
    },

    async update(product: Product) {
        const { categoryId, ...productData } = product;
        return await prisma.product.update({
            where: { id: product.id },
            data: {
                ...productData,
                category: {
                    connect: { id: categoryId },
                }
            },
        });
    },

    async delete(id: string) {
        return await prisma.product.delete({
            where: { id },
        });
    }
}