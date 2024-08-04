import { BaseDTO } from "./base.dto";
import type { OrderItemOutputDTO } from "./orderItem.output.dto";

export class PaymentOutputDTO extends BaseDTO {
    id?: string;
    type: string;
    items: OrderItemOutputDTO[];
}