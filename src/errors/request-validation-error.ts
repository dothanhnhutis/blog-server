import { ZodError } from "zod";
import { CustomError } from "./custom-error";

export class RequestValidatationError extends CustomError {
  statusCode: number = 400;
  constructor(public error: ZodError) {
    super("Invalid request parameters");
    Object.setPrototypeOf(this, RequestValidatationError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined }[] {
    return this.error.issues.map((error) => ({
      message: error.message,
      field: error.path.pop()?.toString(),
    }));
  }
}
