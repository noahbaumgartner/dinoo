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
  DB_UPDATE_FAILED = "DB_UPDATE_FAILED",
  DB_DELETE_FAILED = "DB_DELETE_FAILED",
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
  DISPATCHING = "Abschicken...",
  COMPLETING = "Abschliessen...",
  PAYING = "Bezahlen...",
  ORDER_DISPATCHED = "Bestellung abgeschickt",
  ORDER_NOT_DISPATCHED = "Bestellung konnte nicht abgeschickt werden",
  ORDER_COMPLETED = "Bestellung abgeschlossen",
  ORDER_NOT_COMPLETED = "Bestellung konnte nicht abgeschlossen werden",
  SUBPAYMENT_DONE = "Teilzahlung durchgeführt",
  SUBPAYMENT_NOT_DONE = "Teilzahlung konnte nicht durchgeführt werden",
}

export enum PaymentTypes {
  CASH = "CASH",
  TWINT = "TWINT",
}

export enum PaymentTypeTexts {
  CASH = "Bar",
  TWINT = "Twint",
}
