import { Router } from "express";
import validateResource from "../middleware/validateResource";
import ContactController from "../controllers/contact.controller";
import { createContactValidation } from "../validations/contact.validations";
import { rateLimitContact } from "../middleware/rateLimit";
import checkPermission from "../middleware/checkPermission";

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
      this.controller.createContact
    );
    this.routes.get(
      "/",
      checkPermission(["ADMIN", "MANAGER", "SALER"]),
      this.controller.getContact
    );
    this.routes.patch(
      "/:id",
      checkPermission(["ADMIN", "MANAGER", "SALER"]),
      this.controller.editContact
    );
  }
}

export default new CategoryRoutes().routes;
