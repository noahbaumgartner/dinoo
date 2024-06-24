import { IsStrongPassword } from "class-validator";
import { BaseDTO } from "./base.dto";
import { ErrorStates } from "../constants";

export class CredentialsDTO extends BaseDTO {
  username: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: ErrorStates.PASSWORD_NOT_STRONG_ENOUGH },
  )
  password: string;
}
