import { BaseDTO } from "./base.dto";
import type { ModifierDTO } from "./modifier.output.dto";
import type { ProductOutputDTO } from "./product.output.dto";

export class OrderItemOutputDTO extends BaseDTO {
    id?: string;
    product: ProductOutputDTO;
    quantity: number;
    modifiers: ModifierDTO[];
}
