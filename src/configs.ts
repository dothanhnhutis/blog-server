import dotenv from "dotenv";
import z from "zod";

dotenv.config({});

const envSchema = z.object({
  REDIS_HOST: z.string(),
  CLIENT_URL: z.string(),
  POSTGRES_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_REFRESH_TOKEN: z.string(),
  SESSION_KEY_NAME: z.string(),
  SESSION_SECRET: z.string(),
  JWT_SECRET: z.string(),
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_KEY: z.string(),
  CLOUDINARY_SECRET: z.string(),
});

const configParser = envSchema.safeParse({
  CLIENT_URL: process.env.CLIENT_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  POSTGRES_URL: process.env.DATABASE_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  SESSION_KEY_NAME: process.env.SESSION_KEY_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
  CLOUDINARY_KEY: process.env.CLOUDINARY_KEY,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
});

if (!configParser.success) {
  console.error(configParser.error.issues);
  throw new Error("The values ​​in the env file are invalid");
}

const configs = configParser.data;
export default configs;
