import { IsUUID } from "class-validator";
import { BaseDTO } from "./base.dto";
import { IsInt, Min } from "class-validator";

export class OrderItemInputDTO extends BaseDTO {
    @IsUUID()
    productId: string;
    @IsInt({ message: "Quantity must be an integer" })
    @Min(1, { message: "Quantity must be bigger than 0" })
    quantity: number;
    modifierIds: string[];
}
