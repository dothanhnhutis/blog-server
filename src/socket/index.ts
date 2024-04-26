import http from "http";
import { Server, Socket } from "socket.io";
import configs from "../configs";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
let io: Server;

export async function createSocketIO(httpServer: http.Server): Promise<Server> {
  io = new Server(httpServer, {
    cors: {
      origin: `${configs.CLIENT_URL}`,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
  });
  const pubClient = new Redis(configs.REDIS_HOST);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
  return io;
}

export async function socketIOHandler(io: Server) {
  io.on("connection", async (socket: Socket) => {
    console.log("Connected to redis successfully");
  });
}

export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};
