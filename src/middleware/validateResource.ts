import { RequestHandler as Middleware } from "express";
import { AnyZodObject, ZodError } from "zod";
import { RequestValidatationError } from "../errors/request-validation-error";

const validateResource =
  (schema: AnyZodObject): Middleware =>
  (req, res, next) => {
    try {
      const data = schema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
      });
      req.body = data.body;
      req.query = data.query;
      req.params = data.params;
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new RequestValidatationError(error);
      }
      next(error);
    }
  };
export default validateResource;
