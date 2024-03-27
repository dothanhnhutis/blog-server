import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import validateResource from "../middleware/validateResource";
import {
  signinValidation,
  signupValidation,
} from "../validations/auth.validations";

class AuthRoutes {
  routes = Router();
  private controller = new AuthController();
  constructor() {
    this.intializeRoutes();
  }
  private intializeRoutes() {
    this.routes.post(
      "/signin",
      validateResource(signinValidation),
      this.controller.signIn
    );
    this.routes.post(
      "/signup",
      validateResource(signupValidation),
      this.controller.signUp
    );
    this.routes.get("/signout", this.controller.signOut);
  }
}
export default new AuthRoutes().routes;
