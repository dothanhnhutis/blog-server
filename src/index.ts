import * as dotenv from "dotenv";
import app from "./app";
dotenv.config();

const start = () => {
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

  app.listen(4000, () => {
    console.log(`Listening on 4000`);
  });
};

start();
