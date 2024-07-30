import { PrismaClient } from "@prisma/client";
import { OrderInputDTO } from "../dtos/order.input.dto";
import { ErrorStates } from "../constants";
import { OrderOutputDTO } from "../dtos/order.output.dto";

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
                    }
                }
            });

            return this.mapOrderToDTO(order);
        } catch (error) {
            console.log(error);
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

    mapOrderToDTO(order: any) {
        return new OrderOutputDTO({
            id: order.id,
            tableId: order.tableId,
            userId: order.userId,
            user: order.user,
            items: order.OrderItem.map((item: any) => ({
                id: item.id,
                product: item.product,
                quantity: item.quantity,
                modifiers: item.modifiers
            }))
        });
    }
}