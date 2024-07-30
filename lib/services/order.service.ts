import { PrismaClient } from "@prisma/client";
import { OrderInputDTO } from "../dtos/order.input.dto";
import { ErrorStates } from "../constants";

export const orderService = {
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
    }
}