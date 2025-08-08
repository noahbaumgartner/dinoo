import { PrismaClient, type OrderTime } from "@/lib/prisma";

const prisma = new PrismaClient();

export const orderTimeService = {
    async getAll() {
        const orderTimes = await prisma.orderTime.findMany();
        orderTimes.sort((a, b) => {
            if (a.index !== b.index) {
                return a.index - b.index;
            }
            return a.time.localeCompare(b.time);
        });
        return orderTimes;
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
    },

    async update(orderTime: OrderTime) {
        return await prisma.orderTime.update({
            where: { id: orderTime.id },
            data: orderTime,
        });
    },

    async delete(id: string) {
        return await prisma.orderTime.delete({
            where: { id },
        });
    }
}