import { IsEmail, IsString, IsStrongPassword } from "class-validator";
import { BaseDTO } from "./base.dto";
import { ErrorStates } from "../constants";

export class UserInputDTO extends BaseDTO {
  @IsString({ message: "First name must be a string" })
  firstName: string;

  @IsString({ message: "Last name must be a string" })
  lastName: string;

  @IsEmail({}, { message: ErrorStates.INVALID_EMAIL })
  email: string;

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
