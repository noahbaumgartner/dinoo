import { BaseDTO } from "./base.dto";

export class ProductOutputDTO extends BaseDTO {
    id: string;
    name: string;
    price: number;
}