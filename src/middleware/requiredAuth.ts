import { RequestHandler as Middleware } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requiredAuth: Middleware = (req, res, next) => {
  if (!res.locals.currentUser) {
    throw new NotAuthorizedError();
  }
  next();
};
