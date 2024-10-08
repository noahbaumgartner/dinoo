import { PrismaClient } from "@prisma/client";
import { OrderInputDTO } from "../dtos/order.input.dto";
import { ErrorStates } from "../constants";
import { OrderOutputDTO } from "../dtos/order.output.dto";
import { userService } from "./user.service";
import { OrderItemOutputDTO } from "../dtos/orderItem.output.dto";
import { productService } from "./product.service";
import { PaymentOutputDTO } from "../dtos/payment.output.dto";
import { PaymentItemOutputDTO } from "../dtos/paymentItem.output.dto";

export const orderService = {
    async getById(id: string) {
        const prisma = new PrismaClient();

        try {
            const order = await prisma.order.findUnique({
                where: { 
                    id,
                },
                include: {
                    user: true,
                    OrderItem: {
                        include: {
                            product: true
                        }
                    },
                    Payment: {
                        include: {
                            PaymentItem: {
                                include: {
                                    orderItem: true
                                }
                            }
                        }
                    }
                }
            });

            return this.mapOrderToDTO(order);
        } catch (error) {
            console.error(error);
            throw new Error(ErrorStates.DB_READ_FAILED);
        }
    },

    async create(orderDTO: OrderInputDTO) {
        const prisma = new PrismaClient();

        try {
            const order = await prisma.order.create({
                data: {
                    tableId: orderDTO.tableId,
                    userId: orderDTO.userId,
                    OrderItem: {
                        create: orderDTO.items.map(item => ({
                            quantity: item.quantity,
                            product: {
                                connect: { id: item.productId }
                            }
                        }))
                    }
                }
            })

            return order.id;
        } catch (error) {
            throw new Error(ErrorStates.DB_CREATE_FAILED);
        }
    },

    async setCompleted(orderId: string) {
        const prisma = new PrismaClient();

        try {
            const order = await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    completed: true
                }
            });

            return order.id;
        } catch (error) {
            throw new Error(ErrorStates.DB_UPDATE_FAILED);
        }
    },

    mapOrderToDTO(order: any) {
        return new OrderOutputDTO({
            id: order.id,
            completed: order.completed,
            tableId: order.tableId, 
            user: userService.mapUserToDTO(order.user),
            items: order.OrderItem.map((item: any) => this.mapOrderItemToDTO(item)),
            payments: order.Payment.map((payment: any) => this.mapPaymentToDTO(payment))
        });
    },

    mapOrderItemToDTO(orderItem: any) {
        return new OrderItemOutputDTO({
            id: orderItem.id,
            product: productService.mapProductToDTO(orderItem.product),
            quantity: orderItem.quantity,
            modifiers: orderItem.modifiers
        });
    },

    mapPaymentToDTO(payment: any) {
        return new PaymentOutputDTO({
            id: payment.id,
            type: payment.type,
            items: payment.PaymentItem.map((item: any) => this.mapPaymentItemToDTO(item))
        });
    },

    mapPaymentItemToDTO(paymentItem: any) {
        return new PaymentItemOutputDTO({
            id: paymentItem.id,
            quantity: paymentItem.quantity,
            orderItem: this.mapOrderItemToDTO(paymentItem.orderItem)
        });
    }
}