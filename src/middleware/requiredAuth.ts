import { RequestHandler as Middleware } from "express";
import { NotAuthorizedError, PermissionError } from "../error-handler";

export const requiredAuth: Middleware = (req, res, next) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }
  if (!req.currentUser.isActive) {
    throw new PermissionError();
  }
  next();
};
