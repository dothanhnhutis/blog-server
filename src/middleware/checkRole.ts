import { RequestHandler as Middleware, Request } from "express";
import { PermissionError } from "../errors/permission-error";

export const roleAccess =
  (roles: string[]): Middleware =>
  (req, res, next) => {
    if (res.locals.currentUser && roles.includes(res.locals.currentUser.role)) {
      next();
    } else {
      throw new PermissionError();
    }
  };
