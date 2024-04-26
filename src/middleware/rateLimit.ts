import { Request } from "express";
import { rateLimit } from "express-rate-limit";
import { CreateContact } from "../validations/contact.validations";

export const rateLimitContact = rateLimit({
  windowMs: 60 * 1000,
  limit: 2,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: function (req: Request<{}, {}, CreateContact["body"]>) {
    return req.body.sessionId;
  },
  handler: (req, res, next, options) => {
    console.log(options);
    return res.status(options.statusCode).send(options.message);
  },
});
