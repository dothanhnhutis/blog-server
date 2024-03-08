import { Router } from "express";
import { requiredAuth } from "../middleware/requiredAuth";
import UserController from "../controllers/user.controller";
import checkPermission from "../middleware/checkPermission";
import validateResource from "../middleware/validateResource";
import {
  createUserValidation,
  editProfileValidation,
  editUserValidation,
  queryUserValidation,
} from "../validations/user.validations";
import checkCSRF from "../middleware/checkCSRF";

class UserRoutes {
  routers = Router();
  private controller = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.routers.get(
      "/authors",
      requiredAuth,
      checkPermission(["ADMIN", "MANAGER", "WRITER"]),
      validateResource(queryUserValidation),
      this.controller.getAuthor
    );
    this.routers.get("/me", requiredAuth, this.controller.currentUser);
    this.routers.get(
      "/:id",
      requiredAuth,
      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.getUserById
    );
    this.routers.get(
      "/",
      requiredAuth,
      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.getAllUser
    );

    this.routers.patch(
      "/:id",
      requiredAuth,
      checkCSRF,
      checkPermission(["ADMIN", "MANAGER"]),
      validateResource(editUserValidation),
      this.controller.edit
    );
    this.routers.patch(
      "/",
      requiredAuth,
      checkCSRF,
      validateResource(editProfileValidation),
      this.controller.editProfile
    );
    this.routers.post(
      "/",
      requiredAuth,
      checkCSRF,
      checkPermission(["ADMIN", "MANAGER"]),
      validateResource(createUserValidation),
      this.controller.creatUser
    );
  }
}
export default new UserRoutes().routers;
