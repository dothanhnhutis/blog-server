import dotenv from "dotenv";

dotenv.config({});

class Config {
  public CLIENT_URL: string;
  public POSTGRES_URL: string;
  public GOOGLE_CLIENT_ID: string;
  public GOOGLE_CLIENT_SECRET: string;
  public GOOGLE_REDIRECT_URI: string;
  public GOOGLE_REFRESH_TOKEN: string;
  public SESSION_KEY_NAME: string;
  public SESSION_SECRET: string;
  public JWT_SECRET: string;
  public CLOUDINARY_NAME: string;
  public CLOUDINARY_KEY: string;
  public CLOUDINARY_SECRET: string;
  constructor() {
    this.CLIENT_URL = process.env.CLIENT_URL || "";
    this.POSTGRES_URL = process.env.DATABASE_URL || "";
    this.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
    this.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
    this.GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";
    this.GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || "";
    this.SESSION_KEY_NAME = process.env.SESSION_KEY_NAME || "";
    this.SESSION_SECRET = process.env.SESSION_SECRET || "";
    this.JWT_SECRET = process.env.JWT_SECRET || "";
    this.CLOUDINARY_NAME = process.env.CLOUDINARY_NAME || "";
    this.CLOUDINARY_KEY = process.env.CLOUDINARY_KEY || "";
    this.CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET || "";
  }
}

export const config = new Config();
