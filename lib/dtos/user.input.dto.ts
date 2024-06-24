import { IsEmail, IsString, IsStrongPassword, MinLength } from "class-validator";
import { BaseDTO } from "./base.dto";
import { ErrorStates } from "../constants";

export class UserInputDTO extends BaseDTO {
  @MinLength(2, { message: ErrorStates.NOT_LONG_ENOUGH })
  firstName: string;

  @MinLength(2, { message: ErrorStates.NOT_LONG_ENOUGH })
  lastName: string;

  @MinLength(2, { message: ErrorStates.NOT_LONG_ENOUGH })
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
