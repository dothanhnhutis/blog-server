import "express-async-errors";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

import routes from "./router";
import { IErrorResponse, NotFoundError } from "./error-handler";
import { CustomError } from "./error-handler";
import deserializeUser from "./middleware/deserializeUser";
import helmet from "helmet";
import { config } from "./config";
import { StatusCodes } from "http-status-codes";

const SERVER_PORT = 4000;
const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 180;

export default class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.config();
  }

  private config() {
    this.app.set("trust proxy", 1);
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
      prefix: "ich-cookie:",
    });

    this.app.use(
      morgan(process.env.NODE_ENV == "production" ? "combined" : "dev")
    );
    this.app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      })
    );
    this.app.use(helmet());
    this.app.use(express.json({ limit: "200mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "200mb" }));
    this.app.use(
      session({
        name: process.env.SESSION_KEY_NAME ?? "session",
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET!,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV == "production",
          maxAge: SESSION_MAX_AGE,
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
      (
        error: IErrorResponse,
        req: Request,
        res: Response,
        next: NextFunction
      ) => {
        if (error instanceof CustomError) {
          return res.status(error.statusCode).json(error.serializeErrors());
        }
        console.log(error);
        // req.session.destroy(function (err) {});
        // res.clearCookie("session");
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .send({ message: "Something went wrong" });
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

    this.app.listen(SERVER_PORT, () => {
      console.log(`Listening on ${SERVER_PORT}`);
    });
  }
}
