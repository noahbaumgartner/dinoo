import { PrismaClient } from "@prisma/client";
import type { PaymentInputDTO } from "../dtos/payment.input.dto";
import { ErrorStates } from "../constants";

export const paymentService = {
    async getAll(orderId: string) {
        const prisma = new PrismaClient();

        try {
            const payments = await prisma.payment.findMany({
                where: {
                    orderId: orderId
                }
            });

            return payments;
        } catch (error) {
            throw new Error(ErrorStates.DB_READ_FAILED);
        }
    },

    async create(paymentDTO: PaymentInputDTO, orderId: string) {
        const prisma = new PrismaClient();

        try {
            const order = await prisma.payment.create({
                data: {
                    type: paymentDTO.type,
                    orderId: orderId,
                    PaymentItem: {
                        create: paymentDTO.items.map(item => ({
                            quantity: item.quantity,
                            orderItem: { connect: { id: item.orderItemId } }
                        }))
                    }
                }
            })

            return order.id;
        } catch (error) {
            throw new Error(ErrorStates.DB_CREATE_FAILED);
        }
    },

    async delete(paymentId: string) {
        const prisma = new PrismaClient();

        try {
            await prisma.payment.delete({
                where: {
                    id: paymentId
                }
            });
        } catch (error) {
            throw new Error(ErrorStates.DB_DELETE_FAILED);
        }
    }
};