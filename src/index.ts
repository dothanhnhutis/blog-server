import * as dotenv from "dotenv";
dotenv.config();
import Server from "./server";
const server: Server = new Server();
server.start();
