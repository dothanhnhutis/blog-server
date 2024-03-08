import "express-async-errors";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

import routes from "./router";
import { NotFoundError } from "./errors/not-found-error";
import { CustomError } from "./errors/custom-error";
import deserializeUser from "./middleware/deserializeUser";
import helmet from "helmet";

export default class Server {
  private app: Application;
  private origin: string = "http://localhost:3000";
  private sessionMaxAge: number = 1000 * 60 * 60 * 24 * 180;

  constructor() {
    this.app = express();
    this.config();
  }

  private config() {
    const redisClient = createClient();

    redisClient.on("error", function (err) {
      console.log("Could not establish a connection with redis. " + err);
    });

    redisClient.on("connect", function (err) {
      console.log("Connected to redis successfully");
    });

    redisClient.connect();

    const redisStore = new RedisStore({
      client: redisClient,
      prefix: "myapp:",
    });

    this.app.use(
      morgan(process.env.NODE_ENV == "production" ? "combined" : "dev")
    );
    this.app.use(
      cors({
        origin: this.origin,
        credentials: true,
      })
    );
    this.app.use(helmet());
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(
      session({
        name: process.env.SESSION_KEY_NAME ?? "session",
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET!,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV == "production",
          maxAge: this.sessionMaxAge,
        },
        store: redisStore,
      })
    );
    // middleware
    this.app.use(deserializeUser);
    // routes
    this.app.use("/api/v1", routes);
    // handle 404
    this.app.use((req, res, next) => {
      // req.session.destroy(function (err) {});
      // res.clearCookie("session");
      throw new NotFoundError();
    });
    // handle error
    this.app.use(
      (error: Error, req: Request, res: Response, next: NextFunction) => {
        if (error instanceof CustomError) {
          return res
            .status(error.statusCode)
            .send({ errors: error.serializeErrors() });
        }
        console.log(error);
        // req.session.destroy(function (err) {});
        // res.clearCookie("session");
        return res.status(500).send({
          errors: [{ message: "Something went wrong" }],
        });
      }
    );
  }

  start() {
    if (!process.env.DATABASE_URL)
      throw new Error("DATABASE_URL must be defined");
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be defined");
    if (!process.env.GOOGLE_CLIENT_ID)
      throw new Error("GOOGLE_CLIENT_ID must be defined");
    if (!process.env.GOOGLE_CLIENT_SECRET)
      throw new Error("GOOGLE_CLIENT_SECRET must be defined");
    if (!process.env.GOOGLE_REDIRECT_URI)
      throw new Error("GOOGLE_REDIRECT_URI must be defined");
    if (!process.env.GOOGLE_REFRESH_TOKEN)
      throw new Error("GOOGLE_REFRESH_TOKEN must be defined");
    if (!process.env.SESSION_KEY_NAME)
      throw new Error("SESSION_KEY_NAME must be defined");

    this.app.listen(4000, () => {
      console.log(`Listening on 4000`);
    });
  }
}
