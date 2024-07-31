import { ProductOutputDTO } from "../dtos/product.output.dto";

export const productService = {
    mapProductToDTO(product: any) {
        return new ProductOutputDTO({
            id: product.id,
            name: product.name,
            price: product.price
        });
    }
}