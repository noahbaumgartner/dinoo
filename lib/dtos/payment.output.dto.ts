import { BaseDTO } from "./base.dto";
import type { PaymentItemOutputDTO } from "./paymentItem.output.dto";

export class PaymentOutputDTO extends BaseDTO {
    id?: string;
    type: string;
    items: PaymentItemOutputDTO[];
}