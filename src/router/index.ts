import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import otpRoutes from "./otp.routes";
import tagRoutes from "./tag.routes";
import blogRoutes from "./blog.routes";
import productRoutes from "./product.routes";
import categoruRoutes from "./catorogy.routes";

class Routes {
  router = Router();
  constructor() {
    this.router.use("/auth", authRoutes);
    this.router.use("/otps", otpRoutes);
    this.router.use("/users", userRoutes);
    this.router.use("/tags", tagRoutes);
    this.router.use("/blogs", blogRoutes);
    this.router.use("/products", productRoutes);
    this.router.use("/categories", categoruRoutes);
  }
}

export default new Routes().router;
