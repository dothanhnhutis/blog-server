import express, { Express } from "express";
import AppServer from "./server";

class Application {
  public initialize(): void {
    const app: Express = express();
    const server: AppServer = new AppServer(app);
    server.start();
  }
}

const application: Application = new Application();
application.initialize();
