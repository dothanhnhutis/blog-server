import { Router } from "express";
import validateResource from "../middleware/validateResource";
import ContactController from "../controllers/contact.controller";
import { createContactValidation } from "../validations/contact.validations";
import { rateLimitContact } from "../middleware/rateLimit";

class CategoryRoutes {
  routes = Router();
  private controller = new ContactController();
  constructor() {
    this.intializeRoutes();
  }
  private intializeRoutes() {
    this.routes.post(
      "/",
      rateLimitContact,
      validateResource(createContactValidation),
      this.controller.contact
    );
  }
}

export default new CategoryRoutes().routes;
