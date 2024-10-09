import { PrismaClient } from "@prisma/client";
import { ProductOutputDTO } from "../dtos/product.output.dto";

export const productService = {
    async getAll() {
        const prisma = new PrismaClient();
        return await prisma.product.findMany();
    },

    mapProductToDTO(product: any) {
        return new ProductOutputDTO({
            id: product.id,
            name: product.name,
            price: product.price
        });
    }
}