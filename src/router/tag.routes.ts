import { Router } from "express";
import validateResource from "../middleware/validateResource";
import {
  createTagValidation,
  deleteTagValidation,
  editTagValidation,
  getTagValidation,
} from "../validations/tag.validations";
import { requiredAuth } from "../middleware/requiredAuth";
import checkPermission from "../middleware/checkPermission";
import TagController from "../controllers/tag.controller";

class TagRoutes {
  routes = Router();
  private controller = new TagController();
  constructor() {
    this.initalizeRoutes();
  }
  private initalizeRoutes() {
    this.routes.patch(
      "/:id",
      validateResource(editTagValidation),
      requiredAuth,

      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.editTag
    );
    this.routes.delete(
      "/:id",
      validateResource(deleteTagValidation),
      requiredAuth,

      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.deleteTag
    );
    this.routes.get(
      "/:id",
      validateResource(getTagValidation),
      this.controller.getTagById
    );
    this.routes.post(
      "/",
      validateResource(createTagValidation),
      requiredAuth,
      checkPermission(["ADMIN", "MANAGER"]),
      this.controller.createTag
    );
    this.routes.get("/", this.controller.getAllTag);
  }
}

export default new TagRoutes().routes;
