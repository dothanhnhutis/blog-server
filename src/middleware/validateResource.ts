import { RequestHandler as Middleware } from "express";
import { AnyZodObject, ZodError } from "zod";
import { RequestValidatationError } from "../errors/request-validation-error";

export const validateResource =
  (schema: AnyZodObject): Middleware =>
  (req, res, next) => {
    try {
      schema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new RequestValidatationError(error);
      }
      next(error);
    }
  };
