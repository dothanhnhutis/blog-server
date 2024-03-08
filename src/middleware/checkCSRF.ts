import { RequestHandler as Middleware } from "express";
import { PermissionError } from "../errors/permission-error";
import { verifyCSRF } from "../utils/csrf";

const checkCSRF: Middleware = (req, res, next) => {
  if (!res.locals.csrf || !verifyCSRF(res.locals.csrf))
    throw new PermissionError();
  next();
};
export default checkCSRF;
