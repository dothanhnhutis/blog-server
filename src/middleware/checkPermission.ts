import { RequestHandler as Middleware } from "express";
import { PermissionError } from "../errors/permission-error";
import { Role } from "../validations/user.validations";

const checkPermission =
  (roles: Role[]): Middleware =>
  (req, res, next) => {
    if (!res.locals.user || !roles.includes(res.locals.user.role))
      throw new PermissionError();

    next();
  };
export default checkPermission;
