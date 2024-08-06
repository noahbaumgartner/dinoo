import { BaseDTO } from "./base.dto";
import type { OrderItemOutputDTO } from "./orderItem.output.dto";

export class PaymentItemOutputDTO extends BaseDTO {
    id?: string;
    quantity: number;
    orderItem: OrderItemOutputDTO;
}
