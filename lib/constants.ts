export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export enum ErrorStates {
  UNAUTHORIZED = "UNAUTHORIZED",
  NOT_LONG_ENOUGH = "NOT_LONG_ENOUGH",
  PASSWORD_NOT_STRONG_ENOUGH = "PASSWORD_NOT_STRONG_ENOUGH",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  INVALID_EMAIL = "INVALID_EMAIL",
  DB_CREATE_FAILED = "DB_CREATE_FAILED",
  DB_READ_FAILED = "DB_READ_FAILED",
  AUTH_FAILED = "AUTH_FAILED",
}

export enum Roles {
  ADMIN = "ADMIN",
}

export enum MenuGroupIcons {
  DRINK_BEER = "DRINK_BEER",
  DRINK_TO_GO = "DRINK_TO_GO",
  FOOD = "FOOD",
  FOOD_CAKE = "FOOD_CAKE",
}

export enum ToastMessages {
  ORDER_CREATED = "Bestellung abgeschickt",
}

export enum PaymentTypes {
  CASH = "CASH",
  TWINT = "TWINT",
}

export enum PaymentTypeTexts {
  CASH = "Bar",
  TWINT = "Twint",
}
