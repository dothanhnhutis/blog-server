import "express-async-errors";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./router";
import { NotFoundError } from "./errors/not-found-error";
import { CustomError } from "./errors/custom-error";
import { deserializeUser } from "./middleware/deserializeUser";
const app: Express = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(deserializeUser);
app.use("/api", router);
// handle 404
app.use((req, res, next) => {
  throw new NotFoundError();
});
//handle error
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .send({ errors: error.serializeErrors() });
  }

  return res.status(400).send({
    errors: [{ message: "Something went wrong" }],
  });
});

export default app;
