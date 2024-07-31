import { PrismaClient } from "@prisma/client";
import { OrderInputDTO } from "../dtos/order.input.dto";
import { ErrorStates } from "../constants";
import { OrderOutputDTO } from "../dtos/order.output.dto";
import { userService } from "./user.service";
import { OrderItemOutputDTO } from "../dtos/orderItem.output.dto";
import { productService } from "./product.service";

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
            user: userService.mapUserToDTO(order.user),
            items: order.OrderItem.map((item: any) => this.mapOrderItemToDTO(item))
        });
    },

    mapOrderItemToDTO(orderItem: any) {
        return new OrderItemOutputDTO({
            id: orderItem.id,
            product: productService.mapProductToDTO(orderItem.product),
            quantity: orderItem.quantity,
            modifiers: orderItem.modifiers
        });
    }
}