import { BaseDTO } from "./base.dto";
import type { ProductOutputDTO } from "./product.output.dto";

export class MenuGroupOutputDTO extends BaseDTO {
    id: string;
    name: string;
    icon: string
    color: string;
    items: ProductOutputDTO[];
}
