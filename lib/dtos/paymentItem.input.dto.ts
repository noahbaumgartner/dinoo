import { BaseDTO } from "./base.dto";
import type { OrderItemInputDTO } from "./orderItem.input.dto";
import type { OrderItemOutputDTO } from "./orderItem.output.dto";

export class PaymentItemInputDTO extends BaseDTO {
    id?: string;
    quantity: number;
    orderItemId: string;
}
