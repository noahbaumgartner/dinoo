import { IsUUID } from "class-validator";
import { BaseDTO } from "./base.dto";
import type { OrderItemInputDTO } from "./orderItem.input.dto";

export class OrderInputDTO extends BaseDTO {
    @IsUUID()
    tableId: string;
    @IsUUID()
    userId: string;
    items: OrderItemInputDTO[];
}