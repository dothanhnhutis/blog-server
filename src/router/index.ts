import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
// import otpRoutes from "./otp.routes";
import tagRoutes from "./tag.routes";
import postRoutes from "./post.routes";
import productRoutes from "./product.routes";
import categorRoutes from "./catorogy.routes";
import contactRoutes from "./contact.routes";

class Routes {
  router = Router();
  constructor() {
    this.router.use("/auth", authRoutes);
    // this.router.use("/otps", otpRoutes);
    this.router.use("/users", userRoutes);
    this.router.use("/tags", tagRoutes);
    this.router.use("/posts", postRoutes);
    this.router.use("/products", productRoutes);
    this.router.use("/categories", categorRoutes);
    this.router.use("/contacts", contactRoutes);
  }
}

export default new Routes().router;
