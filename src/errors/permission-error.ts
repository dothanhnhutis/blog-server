import { CustomError } from "./custom-error";

export class PermissionError extends CustomError {
  statusCode: number = 403;
  constructor() {
    super("Permission denied");
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: "Permission denied" }];
  }
}
