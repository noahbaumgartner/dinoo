import { BaseDTO } from "./base.dto";
import type { OrderItemInputDTO } from "./orderItem.input.dto";
import type { OrderItemOutputDTO } from "./orderItem.output.dto";
import type { UserOutputDTO } from "./user.output.dto";

export class OrderOutputDTO extends BaseDTO {
    id: string;
    tableId: string;
    userId: string;
    user: UserOutputDTO;
    items: OrderItemOutputDTO[];
}