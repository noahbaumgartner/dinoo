import { PrismaClient, type OrderTime } from "@/lib/prisma";

const prisma = new PrismaClient();

export const orderTimeService = {
    async getAll() {
        return await prisma.orderTime.findMany();
    },

    async create(orderTime: OrderTime) {
        return await prisma.orderTime.create({
            data: orderTime
        });
    }
}