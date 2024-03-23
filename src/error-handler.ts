import { StatusCodes } from "http-status-codes";

export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  serializeErrors(): IError;
}

export interface IError {
  message: string;
  statusCode: number;
  status: string;
}

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract status: string;
  constructor(message: string) {
    super(message);
  }
  serializeErrors(): IError {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
    };
  }
}

export class BadRequestError extends CustomError {
  statusCode: number = StatusCodes.BAD_REQUEST;
  status: string = "error";
  constructor(public message: string) {
    super(message);
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode: number = StatusCodes.UNAUTHORIZED;
  status: string = "error";
  constructor() {
    super("Not Authorized");
  }
}

export class NotFoundError extends CustomError {
  statusCode: number = StatusCodes.NOT_FOUND;
  status: string = "error";
  constructor() {
    super("Route not found");
  }
}

export class PermissionError extends CustomError {
  statusCode: number = StatusCodes.FORBIDDEN;
  status: string = "error";
  constructor() {
    super("Permission denied");
  }
}
