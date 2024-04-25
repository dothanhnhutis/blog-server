import http from "http";
import { Server } from "socket.io";
import configs from "../configs";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
let socketServer: Server;

export function start(httpServer: http.Server) {
  const pubClient = new Redis(configs.REDIS_HOST);
  const subClient = pubClient.duplicate();

  socketServer = new Server(httpServer, {
    cors: {
      origin: `${configs.CLIENT_URL}`,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
    adapter: createAdapter(pubClient, subClient),
  });
}

export default socketServer;
