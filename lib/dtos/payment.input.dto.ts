import { BaseDTO } from "./base.dto";
import type { PaymentItemInputDTO } from "./paymentItem.input.dto";

export class PaymentInputDTO extends BaseDTO {
    id?: string;
    type: string;
    items: PaymentItemInputDTO[];
}