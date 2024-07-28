import { BaseDTO } from "./base.dto";

export class ModifierDTO extends BaseDTO {
    id: string;
    name: string;
    price: number;
    maxQuantity: number;
}
