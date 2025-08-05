import { PrismaClient, type OrderTime } from "@/lib/prisma";

const prisma = new PrismaClient();

export const orderTimeService = {
    async getAll() {
        return await prisma.orderTime.findMany();
    },

    async getById(id: string) {
        return await prisma.orderTime.findUnique({
            where: { id },
        });
    },

    async create(orderTime: OrderTime) {
        return await prisma.orderTime.create({
            data: orderTime
        });
    }
}