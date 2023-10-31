import * as dotenv from "dotenv";
import app from "./app";
dotenv.config();

const start = () => {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL must be defined");
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be defined");

  app.listen(4000, () => {
    console.log(`Listening on 4000`);
  });
};

start();
