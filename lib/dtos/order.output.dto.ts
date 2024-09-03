import { BaseDTO } from "./base.dto";
import type { OrderItemOutputDTO } from "./orderItem.output.dto";
import type { PaymentOutputDTO } from "./payment.output.dto";
import type { UserOutputDTO } from "./user.output.dto";

export class OrderOutputDTO extends BaseDTO {
    id: string;
    completed: boolean;
    tableId: string;
    user: UserOutputDTO;
    items: OrderItemOutputDTO[];
    payments: PaymentOutputDTO[];
}