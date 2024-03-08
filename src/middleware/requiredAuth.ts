import { RequestHandler as Middleware } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";
import { PermissionError } from "../errors/permission-error";

export const requiredAuth: Middleware = (req, res, next) => {
  if (!res.locals.user) {
    throw new NotAuthorizedError();
  }
  if (!res.locals.user.isActive) {
    throw new PermissionError();
  }
  next();
};
