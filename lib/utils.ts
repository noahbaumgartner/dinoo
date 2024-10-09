import { validate } from "class-validator";
import { BaseDTO } from "./dtos/base.dto";
import { ErrorStates, HttpStatus } from "./constants";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export async function validateDTO(dto: BaseDTO) {
  const validationErrors = await validate(dto);
  return validationErrors.map((error: any) => {
    if (error.constraints) return Object.values(error.constraints)[0];
  });
}

export function getHttpStatusFromErrorState(errorState: ErrorStates) {
  switch (errorState) {
    case ErrorStates.USER_ALREADY_EXISTS:
      return HttpStatus.BAD_REQUEST;
    case ErrorStates.DB_CREATE_FAILED:
      return HttpStatus.INTERNAL_SERVER_ERROR;
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}