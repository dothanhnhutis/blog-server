import { Router } from "express";
import OTPController from "../controllers/otp.controller";
import validateResource from "../middleware/validateResource";
import { otpCreateUserValidation } from "../validations/otp.validations";

class OTPRoutes {
  routes = Router();
  private controller = new OTPController();

  constructor() {
    this.intializeRoutes();
  }
  private intializeRoutes() {
    this.routes.post(
      "/create-user",
      validateResource(otpCreateUserValidation),
      this.controller.send
    );
  }
}

export default new OTPRoutes().routes;
