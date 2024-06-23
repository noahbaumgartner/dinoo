import { BaseDTO } from "./base.dto";

export class UserOutputDTO extends BaseDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
