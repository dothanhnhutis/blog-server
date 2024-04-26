import configs from "../configs";
import RedisStore from "connect-redis";
import Redis from "ioredis";

export function createRedisStore() {
  const redisClient = new Redis(configs.REDIS_HOST);

  redisClient.on("error", function (err) {
    console.log("Could not establish a connection with redis. " + err);
  });

  redisClient.on("connect", function () {
    console.log("Connected to redis successfully");
  });

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: "ich-cookie:",
  });
  return redisStore;
}
