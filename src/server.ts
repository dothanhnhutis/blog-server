import "express-async-errors";
import http from "http";
import express, { Request, Response, NextFunction, Application } from "express";
import cors from "cors";
import morgan from "morgan";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import { Cluster } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import routes from "./router";
import { IErrorResponse, NotFoundError } from "./error-handler";
import { CustomError } from "./error-handler";
import deserializeUser from "./middleware/deserializeUser";
import helmet from "helmet";
import configs from "./configs";
import { StatusCodes } from "http-status-codes";

const SERVER_PORT = 4000;
const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 180;

export default class AppServer {
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
        origin: configs.CLIENT_URL,
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

  private async startServer(app: Application) {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);

      this.startHttpServer(httpServer);
    } catch (error) {
      console.log("GatewayService startServer() error method:", error);
    }
  }
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: `${configs.CLIENT_URL}`,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      },
    });
    const pubClient = createClient({ url: configs.REDIS_HOST });
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server) {
    try {
      console.log(`App server has started with process id ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        console.log(`App server running on port ${SERVER_PORT}`);
      });
    } catch (error) {
      console.log("AppService startServer() method error:", error);
    }
  }

  start() {
    this.startServer(this.app);
  }
}
