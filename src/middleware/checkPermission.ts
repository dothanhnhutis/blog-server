import { RequestHandler as Middleware } from "express";
import { Role } from "../validations/user.validations";
import { PermissionError } from "../error-handler";

const checkPermission =
  (roles: Role[]): Middleware =>
  (req, res, next) => {
    if (!req.currentUser || !roles.includes(req.currentUser.role))
      throw new PermissionError();
    next();
  };
export default checkPermission;
